import React, { useState, useEffect } from 'react'
import './ProductDetailPage.css'
import { fetchProductById, transformProductData } from '../services/api'

function ProductDetailPage({ productId, product, onClose, onAddToCart, cart, onIncreaseQuantity, onDecreaseQuantity, onQuickAddSix }) {
  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  
  // Get reviews from product data (from API)
  const reviews = productData?.reviews || []
  
  // Get average rating and total reviews from reviewsMetaData, fallback to calculated values
  const averageRating = productData?.reviewsMetaData?.averageRating !== undefined
    ? (typeof productData.reviewsMetaData.averageRating === 'number' 
      ? productData.reviewsMetaData.averageRating.toFixed(1)
      : parseFloat(productData.reviewsMetaData.averageRating).toFixed(1))
    : (reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : '0.0')
  
  const totalReviews = productData?.reviewsMetaData?.totalReviews !== undefined
    ? productData.reviewsMetaData.totalReviews
    : reviews.length

  useEffect(() => {
    // Scroll to top when product page loads (instant, not smooth, to prevent scrolled-down issue)
    window.scrollTo(0, 0)
  }, [productId, product])

  useEffect(() => {
    // If product data is passed directly, use it (from Collections API)
    if (product) {
      // Use images array from API, fallback to image if images array is not available
      const productWithImages = {
        ...product,
        images: product.images && product.images.length > 0 
          ? product.images 
          : (product.image ? [product.image] : [])
      }
      setProductData(productWithImages)
      setLoading(false)
      return
    }

    // If only productId is provided, fetch from API
    if (productId) {
      const loadProduct = async () => {
        try {
          setLoading(true)
          const productData = await fetchProductById(productId)
          const transformedProduct = transformProductData(productData)
          
          if (transformedProduct) {
            // Ensure images array is set
            const productWithImages = {
              ...transformedProduct,
              images: transformedProduct.images && transformedProduct.images.length > 0 
                ? transformedProduct.images 
                : (transformedProduct.image ? [transformedProduct.image] : [])
            }
            setProductData(productWithImages)
          } else {
            setProductData(null)
          }
        } catch (error) {
          console.error('Error fetching product:', error)
          setProductData(null)
        } finally {
          setLoading(false)
        }
      }
      
      loadProduct()
    }
  }, [productId, product])

  if (!productId && !product) {
    return null
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <p>Product not found</p>
          <button className="btn btn-primary" onClick={onClose}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Use images array from API
  const allImages = productData.images && productData.images.length > 0 
    ? productData.images 
    : (productData.image ? [productData.image] : [])
  
  // Get current displayed image
  const currentImage = allImages[selectedImage] || allImages[0] || ''
  
  // Check if product is in cart and get quantity
  const cartItem = cart?.find(item => item.id === productData?.id)
  const isInCart = cartItem !== undefined
  const quantity = cartItem?.quantity || 0

  // Swipe handlers for mobile
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && selectedImage < allImages.length - 1) {
      setSelectedImage(selectedImage + 1)
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(selectedImage - 1)
    }
  }

  return (
    <div className="product-detail-page">
      {/* Subtle back icon - only visible on hover */}
      <button className="back-icon" onClick={onClose} aria-label="Go back">
        <span>←</span>
      </button>


      <div className="product-detail-container">
        <div className="product-detail-main">
          {/* Image Section */}
          <div className="product-images-section">
            <div 
              className="main-image-container"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {productData.hasDiscount && (
                <div className="discount-ribbon">
                  <span className="ribbon-text">✨ Special Offer ✨</span>
                  <div className="ribbon-tail"></div>
                </div>
              )}
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={productData.name}
                  className="main-product-image"
                />
              ) : (
                <div className="main-product-image placeholder">
                  <span>🏺</span>
                </div>
              )}
              {productData.hasDiscount && (
                <div className="discount-sparkles">
                  <span className="sparkle sparkle-1">✨</span>
                  <span className="sparkle sparkle-2">✨</span>
                  <span className="sparkle sparkle-3">✨</span>
                  <span className="sparkle sparkle-4">✨</span>
                </div>
              )}
              
              {/* Image indicators for mobile */}
              {allImages.length > 1 && (
                <div className="image-indicators">
                  {allImages.map((_, index) => (
                    <span
                      key={index}
                      className={`image-indicator ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    ></span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Additional Images Thumbnails */}
            {allImages.length > 1 && (
              <div className="thumbnail-images">
                <div className="thumbnail-label">More Images</div>
                <div className="thumbnail-grid">
                  {allImages.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail-wrapper ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={img}
                        alt={`${productData.name} view ${index + 1}`}
                        className="thumbnail"
                      />
                      {selectedImage === index && (
                        <div className="thumbnail-overlay">
                          <span className="check-icon">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section - Desktop: shown in images section */}
            <div className="reviews-section reviews-section-desktop">
              <div className="reviews-header">
                <h3>Customer Reviews</h3>
                <div className="reviews-summary">
                  <div className="average-rating">
                    <span className="rating-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span 
                          key={i} 
                          className={`star ${i < Math.round(parseFloat(averageRating)) ? 'filled' : 'empty'}`}
                        >
                          ★
                        </span>
                      ))}
                    </span>
                    <span className="rating-number">{averageRating}</span>
                  </div>
                  <span className="reviews-count">({totalReviews} reviews)</span>
                </div>
              </div>

              <div className="reviews-list">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="reviewer-details">
                            <div className="reviewer-name">{review.userName}</div>
                            <div className="review-date">
                              {new Date(review.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="review-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span 
                              key={i} 
                              className={`star ${i < review.rating ? 'filled' : 'empty'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="review-comment">
                        {review.comment}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews">
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-title">{productData.name}</h1>
              {/* Product Rating */}
              {reviews.length > 0 && (
                <div className="product-rating-header">
                  <div className="rating-stars-header">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={`star-header ${i < Math.round(parseFloat(averageRating)) ? 'filled' : 'empty'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-number-header">{averageRating}</span>
                  <span className="reviews-count-header">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                </div>
              )}
              <div className={`price-section ${productData.hasDiscount ? 'price-section-discount' : ''} price-section-with-cart`}>
                {productData.hasDiscount ? (
                  <div className="price-with-discount">
                    {productData.hasDiscount && (
                      <div className="discount-banner">
                        <span className="banner-icon">🎉</span>
                        <span className="banner-text">Limited Time Offer</span>
                      </div>
                    )}
                    <div className="price-row">
                      <span className="product-price-original-large">₹{productData.price}</span>
                      <span className="product-price-discounted-large">₹{productData.discountedPrice}</span>
                      <span className="product-discount-badge-large">{productData.discountPercentage}% OFF</span>
                    </div>
                    <span className="price-label">Inclusive of all taxes</span>
                    {productData.hasDiscount && (
                      <div className="savings-highlight">
                        <span className="savings-icon">💰</span>
                        <span className="savings-text">You save ₹{productData.price - productData.discountedPrice}</span>
                      </div>
                    )}
                    {isInCart ? (
                      <div className="quantity-controls-wrapper">
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn quantity-btn-decrease"
                            onClick={() => onDecreaseQuantity(productData.id)}
                          >
                            −
                          </button>
                          <span className="quantity-display">{quantity}</span>
                          <button 
                            className="quantity-btn quantity-btn-increase"
                            onClick={() => onIncreaseQuantity(productData.id)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="btn btn-quick-add"
                          onClick={() => onQuickAddSix(productData)}
                          title="Quick add 6 items"
                        >
                          +6
                        </button>
                      </div>
                    ) : (
                      <div className="add-to-cart-buttons">
                        <button 
                          className="btn btn-primary btn-large btn-add-to-cart-in-price btn-add-to-cart-discount-action"
                          onClick={() => {
                            onAddToCart(productData)
                          }}
                        >
                          <span className="btn-icon">🛒</span>
                          <span>Add to Cart</span>
                        </button>
                        <button 
                          className="btn btn-quick-add btn-quick-add-standalone"
                          onClick={() => onQuickAddSix(productData)}
                          title="Quick add 6 items"
                        >
                          +6
                        </button>
                      </div>
                    )}
                    <p className="cart-note">✨ Secure checkout • Fast delivery</p>
                  </div>
                ) : (
                  <>
                    <p className="product-price-large">₹{productData.price}</p>
                    <span className="price-label">Inclusive of all taxes</span>
                    {isInCart ? (
                      <div className="quantity-controls-wrapper">
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn quantity-btn-decrease"
                            onClick={() => onDecreaseQuantity(productData.id)}
                          >
                            −
                          </button>
                          <span className="quantity-display">{quantity}</span>
                          <button 
                            className="quantity-btn quantity-btn-increase"
                            onClick={() => onIncreaseQuantity(productData.id)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="btn btn-quick-add"
                          onClick={() => onQuickAddSix(productData)}
                          title="Quick add 6 items"
                        >
                          +6
                        </button>
                      </div>
                    ) : (
                      <div className="add-to-cart-buttons">
                        <button 
                          className="btn btn-primary btn-large btn-add-to-cart-in-price"
                          onClick={() => {
                            onAddToCart(productData)
                          }}
                        >
                          <span className="btn-icon">🛒</span>
                          <span>Add to Cart</span>
                          <span className="btn-arrow">→</span>
                        </button>
                        <button 
                          className="btn btn-quick-add btn-quick-add-standalone"
                          onClick={() => onQuickAddSix(productData)}
                          title="Quick add 6 items"
                        >
                          +6
                        </button>
                      </div>
                    )}
                    <p className="cart-note">✨ Secure checkout • Fast delivery</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="product-description">
              <p>{productData.description}</p>
            </div>

            {/* Trust Badges */}
            {productData.benefits && productData.benefits.length > 0 && (
              <div className="trust-badges">
                {productData.benefits.map((benefit) => {
                  const getEmojiIcon = (value) => {
                    if (value === 'Free Shipping') return '🚚'
                    if (value === 'Easy Returns') return '↩️'
                    if (value === 'Authentic') return '✓'
                    return '✨'
                  }
                  
                  // Check if logo exists and is not empty
                  const hasLogo = benefit.logo && benefit.logo.trim() !== ''
                  
                  return (
                    <div key={benefit.id} className="trust-item">
                      {hasLogo ? (
                        <img 
                          src={benefit.logo} 
                          alt={benefit.value}
                          className="trust-icon-img"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            e.target.style.display = 'none'
                            const emojiSpan = e.target.parentElement.querySelector('.trust-icon-emoji')
                            if (emojiSpan) emojiSpan.style.display = 'inline'
                          }}
                        />
                      ) : null}
                      <span 
                        className="trust-icon trust-icon-emoji" 
                        style={{ display: hasLogo ? 'none' : 'inline' }}
                      >
                        {getEmojiIcon(benefit.value)}
                      </span>
                      <span>{benefit.value}</span>
                    </div>
                  )
                })}
              </div>
            )}


            {/* Features */}
            {productData.features && (
              <div className="product-features">
                <h3>Why You'll Love This</h3>
                <ul>
                  {productData.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {productData.specifications && (
              <div className="product-specifications">
                <h3>Product Details</h3>
                <div className="specs-grid">
                  {productData.specifications.map((spec, index) => (
                    <div key={index} className="spec-item">
                      <span className="spec-label">{spec.label}</span>
                      <span className="spec-value">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Long Description */}
            {productData.about && (
              <div className="product-long-description">
                <h3>About This Product</h3>
                <div className="description-text">
                  {productData.about.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section - Mobile: shown at the end */}
        <div className="reviews-section reviews-section-mobile">
          <div className="reviews-header">
            <h3>Customer Reviews</h3>
            <div className="reviews-summary">
              <div className="average-rating">
                <span className="rating-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`star ${i < Math.round(parseFloat(averageRating)) ? 'filled' : 'empty'}`}
                    >
                      ★
                    </span>
                  ))}
                </span>
                <span className="rating-number">{averageRating}</span>
              </div>
              <span className="reviews-count">({totalReviews} reviews)</span>
            </div>
          </div>

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="reviewer-details">
                        <div className="reviewer-name">{review.userName}</div>
                        <div className="review-date">
                          {new Date(review.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="review-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span 
                          key={i} 
                          className={`star ${i < review.rating ? 'filled' : 'empty'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="review-comment">
                    {review.comment}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage

