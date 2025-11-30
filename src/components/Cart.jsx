import React, { useState, useEffect } from 'react'
import './Cart.css'
import { isUserLoggedIn, getUserData } from '../utils/userStorage'
import { loadUserCart, transformCollectionsData, placeOrder } from '../services/api'
import { POST_PURCHASE_REDIRECT_URL } from '../config/api'
import OrderSuccess from './OrderSuccess'

function Cart({ cart, onIncreaseQuantity, onDecreaseQuantity, onRemoveItem, onClose, onCartUpdate, onNavigate }) {
  const isLoggedIn = isUserLoggedIn()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderPlacing, setOrderPlacing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Load cart data from API
  useEffect(() => {
    const fetchCartData = async () => {
      if (!isLoggedIn) {
        setLoading(false)
        return
      }

      const userData = getUserData()
      if (!userData) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const cartData = await loadUserCart(userData)
        
        // Match cart items with product details
        const products = transformCollectionsData(cartData.ceremics || [])
        const cartWithProducts = (cartData.cart || []).map(cartItem => {
          const product = products.find(p => p.id === cartItem.productId)
          if (product) {
            return {
              ...product,
              quantity: cartItem.quantity,
              cartItemId: cartItem.id
            }
          }
          return null
        }).filter(item => item !== null)

        setCartItems(cartWithProducts || [])
        
        // Update parent cart state if callback provided
        if (onCartUpdate) {
          onCartUpdate(cartWithProducts || [])
        }
      } catch (err) {
        console.error('Error loading cart:', err)
        setError('Failed to load cart. Please try again.')
        setCartItems([]) // Ensure cartItems is always an array
      } finally {
        setLoading(false)
      }
    }

    fetchCartData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  // Helper function to refetch cart data
  const refetchCart = async () => {
    const userData = getUserData()
    if (!userData) return

    try {
      const cartData = await loadUserCart(userData)
      const products = transformCollectionsData(cartData.ceremics || [])
      const cartWithProducts = (cartData.cart || []).map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId)
        if (product) {
          return {
            ...product,
            quantity: cartItem.quantity,
            cartItemId: cartItem.id
          }
        }
        return null
      }).filter(item => item !== null)

      setCartItems(cartWithProducts)
      
      if (onCartUpdate) {
        onCartUpdate(cartWithProducts)
      }
    } catch (err) {
      console.error('Error refetching cart:', err)
    }
  }

  // Refetch cart after quantity updates
  const handleIncrease = async (productId) => {
    await onIncreaseQuantity(productId)
    await refetchCart()
  }

  const handleDecrease = async (productId) => {
    await onDecreaseQuantity(productId)
    await refetchCart()
  }

  const handleRemove = async (productId) => {
    await onRemoveItem(productId)
    await refetchCart()
  }

  const handlePlaceOrder = async () => {
    const userData = getUserData()
    if (!userData) {
      setError('Please login to place an order')
      return
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty')
      return
    }

    try {
      setOrderPlacing(true)
      setError(null)
      
      const response = await placeOrder(userData)
      console.log('Order placed successfully, response:', response)
      
      // If we get a response (even if empty), consider it successful since status was 200
      setOrderSuccess(true)
      console.log('Order success state set to true')
      
      // Wait a bit before refetching to ensure modal shows
      setTimeout(async () => {
        // Refetch cart to show empty cart
        await refetchCart()
      }, 100)

      // Redirect to configured URL after showing success message (2 seconds delay)
      // Only use internal redirects to avoid Google Ads flagging
      setTimeout(() => {
        const redirectUrl = POST_PURCHASE_REDIRECT_URL?.trim()
        
        if (redirectUrl) {
          // Only allow internal redirects (relative paths) - no external URLs
          // This prevents Google Ads from flagging suspicious redirects
          if (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')) {
            // External URLs are not allowed - use internal thank-you page instead
            console.warn('External redirect URLs are not allowed. Using internal thank-you page.')
            if (onNavigate && typeof onNavigate === 'function') {
              onNavigate('thank-you')
              window.history.pushState({}, '', '/Ceremic/thank-you')
            }
          } else {
            // Internal URL - use navigation callback if available
            if (onNavigate && typeof onNavigate === 'function') {
              // Use the navigation callback to change page (internal navigation)
              onNavigate('thank-you')
              // Update URL using pushState (no full page reload)
              const fullPath = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`
              window.history.pushState({}, '', fullPath)
            } else {
              // Fallback: use pushState for internal navigation (no external redirect)
              const fullPath = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`
              window.history.pushState({}, '', fullPath)
              // Trigger a soft navigation by dispatching a popstate event
              window.dispatchEvent(new PopStateEvent('popstate'))
            }
          }
        }
      }, 2000)
    } catch (err) {
      console.error('Error placing order:', err)
      setError('Failed to place order. Please try again.')
    } finally {
      setOrderPlacing(false)
    }
  }

  const handleRemoveItem = (productId) => {
    if (onRemoveItem) {
      onRemoveItem(productId)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-empty-state">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Please login to view your cart</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            {onClose && (
              <button className="cart-close-btn" onClick={onClose}>
                ×
              </button>
            )}
          </div>
          <div className="cart-loading">
            <div className="loading-spinner"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            {onClose && (
              <button className="cart-close-btn" onClick={onClose}>
                ×
              </button>
            )}
          </div>
          <div className="cart-error">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Don't show empty cart state if order was just placed (show success modal instead)
  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            {onClose && (
              <button className="cart-close-btn" onClick={onClose}>
                ×
              </button>
            )}
          </div>
          <div className="cart-empty-state">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some beautiful ceramics to your cart!</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate totals - only after we know cartItems exists
  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0
    return cartItems.reduce((total, item) => {
      const price = item.hasDiscount ? item.discountedPrice : item.price
      return total + (price * item.quantity)
    }, 0)
  }

  const calculateTotalItems = () => {
    if (!cartItems || cartItems.length === 0) return 0
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const subtotal = calculateSubtotal()
  const shipping = 0 // Free shipping
  const total = subtotal + shipping
  const totalItems = calculateTotalItems()

  // Safety check - if we somehow get here without proper state, show loading
  if (!Array.isArray(cartItems)) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-loading">
            <div className="loading-spinner"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    )
  }

  // Debug: Log order success state
  console.log('Cart render - orderSuccess:', orderSuccess)

  return (
    <>
      <div className="cart-page">
        <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <div className="cart-header-info">
            <p className="cart-item-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
            {onClose && (
              <button className="cart-close-btn" onClick={onClose}>
                ×
              </button>
            )}
          </div>
        </div>


        {error && (
          <div className="cart-error-message">
            {error}
          </div>
        )}

        <div className="cart-content">
          <div className="cart-items-section">
            {cartItems.map((item) => {
              const itemPrice = item.hasDiscount ? item.discountedPrice : item.price
              const itemTotal = itemPrice * item.quantity

              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="cart-item-placeholder">🏺</div>
                    )}
                    {item.hasDiscount && (
                      <div className="cart-item-discount-badge">
                        {item.discountPercentage}% OFF
                      </div>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <div className="cart-item-price-info">
                      {item.hasDiscount ? (
                        <div className="cart-item-price-discounted">
                          <span className="cart-item-price-original">₹{item.price}</span>
                          <span className="cart-item-price-current">₹{itemPrice}</span>
                        </div>
                      ) : (
                        <span className="cart-item-price-current">₹{itemPrice}</span>
                      )}
                    </div>
                    <div className="cart-item-total">
                      Total: <strong>₹{itemTotal}</strong>
                    </div>
                  </div>

                    <div className="cart-item-actions">
                    <div className="cart-quantity-controls">
                      <button
                        className="cart-quantity-btn cart-quantity-decrease"
                        onClick={() => handleDecrease(item.id)}
                      >
                        −
                      </button>
                      <span className="cart-quantity-display">{item.quantity}</span>
                      <button
                        className="cart-quantity-btn cart-quantity-increase"
                        onClick={() => handleIncrease(item.id)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-remove-btn"
                      onClick={() => handleRemove(item.id)}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="cart-summary-section">
            <div className="cart-summary-card">
              <h2>Order Summary</h2>
              
              <div className="cart-summary-row">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>

              {cartItems.some(item => item.hasDiscount) && (
                <div className="cart-summary-savings">
                  <span className="savings-label">💰 You saved</span>
                  <span className="savings-amount">
                    ₹{cartItems.reduce((savings, item) => {
                      if (item.hasDiscount) {
                        return savings + ((item.price - item.discountedPrice) * item.quantity)
                      }
                      return savings
                    }, 0).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-total">
                <span>Total</span>
                <span className="total-amount">₹{total.toFixed(2)}</span>
              </div>

              <button
                className="btn btn-checkout"
                onClick={handlePlaceOrder}
                disabled={orderPlacing || cartItems.length === 0}
              >
                {orderPlacing ? (
                  <span>Placing Order...</span>
                ) : (
                  <>
                    <span>Place Order</span>
                    <span className="checkout-arrow">→</span>
                  </>
                )}
              </button>

              <p className="cart-security-note">
                💵 Cash on Delivery • Fast delivery
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Order Success Modal - Rendered outside cart-page for proper z-index */}
      {orderSuccess && (
        <OrderSuccess
          onClose={() => {
            console.log('Closing order success modal')
            setOrderSuccess(false)
            if (onClose) {
              onClose()
            }
          }}
        />
      )}
    </>
  )
}

export default Cart

