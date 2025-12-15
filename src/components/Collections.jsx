import React, { useState, useEffect } from 'react'
import { categories } from '../data/products'
import { fetchCollections, transformCollectionsData, logEvent } from '../services/api'
import { getUserId } from '../utils/userStorage'
import './Collections.css'

function Collections({ onAddToCart, onViewProduct, cart, onIncreaseQuantity, onDecreaseQuantity, onQuickAddSix }) {
  const [selectedCategory, setSelectedCategory] = useState('new')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleProductClick = (product) => {
    const uid = getUserId()
    logEvent({
      action: 'VIEW',
      elementTag: String(product.id),
      pageName: 'COLLECTIONS',
      userId: uid != null ? uid : -1
    })

    if (onViewProduct) {
      onViewProduct(product)
    }
  }

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)

    const uid = getUserId()

    // Log specific actions for All Products and New Arrivals
    if (categoryId === 'all') {
      logEvent({
        action: 'ALL_PRODUCTS',
        elementTag: 'COLLECTIONS_ALL_PRODUCTS',
        pageName: 'COLLECTIONS',
        userId: uid != null ? uid : -1
      })
    } else if (categoryId === 'new') {
      logEvent({
        action: 'NEW_ARRIVALS',
        elementTag: 'COLLECTIONS_NEW_ARRIVALS',
        pageName: 'COLLECTIONS',
        userId: uid != null ? uid : -1
      })
    }
  }

  // Log collections page visit
  useEffect(() => {
    const uid = getUserId()
    logEvent({
      action: 'VISIT',
      elementTag: 'COLLECTIONS_PAGE',
      pageName: 'COLLECTIONS',
      userId: uid != null ? uid : -1
    })
  }, [])

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiData = await fetchCollections()
        const transformedData = transformCollectionsData(apiData)
        setProducts(transformedData)
      } catch (err) {
        console.error('Failed to load collections:', err)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [])

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  return (
    <div className="collections-page">
      <div className="collections-header">
        <h1>Our Collection</h1>
        <p>Discover handcrafted ceramics that bring elegance to your home</p>
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading collections...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="products-grid">
            {filteredProducts.map(product => {
              // Calculate rating from reviews
              const reviews = product.reviews || []
              const averageRating = product.reviewsMetaData?.averageRating !== undefined
                ? (typeof product.reviewsMetaData.averageRating === 'number' 
                  ? product.reviewsMetaData.averageRating.toFixed(1)
                  : parseFloat(product.reviewsMetaData.averageRating).toFixed(1))
                : (reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : '0.0')
              
              const totalReviews = product.reviewsMetaData?.totalReviews !== undefined
                ? product.reviewsMetaData.totalReviews
                : reviews.length

              // Check if product is in cart
              const cartItem = cart?.find(item => item.id === product.id)
              const isInCart = cartItem !== undefined
              const quantity = cartItem?.quantity || 0

              return (
                <div 
                  key={product.id} 
                  className={`product-card-collection ${product.hasDiscount ? 'product-card-discounted' : ''}`}
                >
                  {product.hasDiscount && (
                    <div className="product-discount-ribbon">
                      <span>{product.discountPercentage}% OFF</span>
                    </div>
                  )}
                  <div 
                    className="product-image"
                    onClick={() => handleProductClick(product)}
                    style={{
                      backgroundImage: product.image ? `url(${product.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: product.image ? 'transparent' : 'var(--accent-color)'
                    }}
                  >
                    {!product.image && (
                      <div className="product-image-placeholder">🏺</div>
                    )}
                    {product.hasDiscount && (
                      <div className="product-image-discount-overlay"></div>
                    )}
                  </div>
                  <div className="product-info-collection">
                    <h3>{product.name}</h3>
                    
                    {/* Rating Display */}
                    {totalReviews > 0 && (
                      <div className="product-rating-collection">
                        <div className="rating-stars-collection">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span 
                              key={i} 
                              className={`star-collection ${i < Math.round(parseFloat(averageRating)) ? 'filled' : 'empty'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="rating-number-collection">{averageRating}</span>
                        <span className="reviews-count-collection">({totalReviews})</span>
                      </div>
                    )}

                    <div className="product-price-container">
                      {product.hasDiscount ? (
                        <div>
                          <span className="product-price-original">₹{product.price}</span>
                          <span className="product-price-discounted">₹{product.discountedPrice}</span>
                          <span className="product-discount-badge">{product.discountPercentage}% OFF</span>
                        </div>
                      ) : (
                        <p className="product-price">₹{product.price}</p>
                      )}
                    </div>
                    <div className="product-actions">
                      <button 
                        className="btn btn-view"
                        onClick={() => handleProductClick(product)}
                      >
                        View Details
                      </button>
                      {isInCart ? (
                        <div className="product-actions-cart">
                          <div className="quantity-controls-collection">
                            <button 
                              className="quantity-btn-collection quantity-btn-decrease-collection"
                              onClick={() => onDecreaseQuantity(product.id)}
                            >
                              −
                            </button>
                            <span className="quantity-display-collection">{quantity}</span>
                            <button 
                              className="quantity-btn-collection quantity-btn-increase-collection"
                              onClick={() => onIncreaseQuantity(product.id)}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            className="btn btn-quick-add-collection"
                            onClick={() => onQuickAddSix(product)}
                            title="Quick add 6 items"
                          >
                            +6
                          </button>
                        </div>
                      ) : (
                        <div className="product-actions-add">
                          <button 
                            className={`btn btn-cart ${product.hasDiscount ? 'btn-cart-discounted' : ''}`}
                            onClick={() => onAddToCart(product)}
                          >
                            Add to Cart
                          </button>
                          <button 
                            className="btn btn-quick-add-collection"
                            onClick={() => onQuickAddSix(product)}
                            title="Quick add 6 items"
                          >
                            +6
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="no-products">
              <p>No products found in this category.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Collections

