import React, { useState, useEffect } from 'react'
import './Orders.css'
import { isUserLoggedIn, getUserData } from '../utils/userStorage'
import { loadUserOrderBook, transformCollectionsData } from '../services/api'

function Orders({ onClose }) {
  const isLoggedIn = isUserLoggedIn()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
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
        const orderData = await loadUserOrderBook(userData)
        
        // Match order items with product details
        const products = transformCollectionsData(orderData.ceremics || [])
        const ordersWithProducts = (orderData.orderBooks || []).map(orderItem => {
          const product = products.find(p => p.id === orderItem.productId)
          if (product) {
            return {
              ...product,
              quantity: orderItem.quantity,
              orderId: orderItem.id,
              orderDate: orderItem.createdOn || new Date().toISOString()
            }
          }
          return null
        }).filter(item => item !== null)

        // Group orders by order ID (assuming orders with same timestamp are same order)
        // For now, we'll display all items. If backend provides order grouping, update this
        setOrders(ordersWithProducts)
      } catch (err) {
        console.error('Error loading orders:', err)
        setError('Failed to load orders. Please try again.')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-empty-state">
            <div className="empty-orders-icon">📦</div>
            <h2>Please login to view your orders</h2>
            <p>Login to track your order history</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-loading">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1>My Orders</h1>
            {onClose && (
              <button className="orders-close-btn" onClick={onClose}>
                ×
              </button>
            )}
          </div>
          <div className="orders-error">
            <p>{error}</p>
            <button className="btn btn-retry" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Group orders by order date (same day = same order)
  const groupedOrders = orders.reduce((acc, order) => {
    const orderDate = new Date(order.orderDate).toDateString()
    if (!acc[orderDate]) {
      acc[orderDate] = []
    }
    acc[orderDate].push(order)
    return acc
  }, {})

  const orderGroups = Object.entries(groupedOrders).sort((a, b) => 
    new Date(b[0]) - new Date(a[0])
  )

  const calculateOrderTotal = (orderItems) => {
    return orderItems.reduce((total, item) => {
      const itemPrice = item.hasDiscount ? item.discountedPrice : item.price
      return total + (itemPrice * item.quantity)
    }, 0)
  }

  const calculateOrderItems = (orderItems) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <div className="orders-header-info">
            <p className="orders-count">{orders.length} {orders.length === 1 ? 'item' : 'items'}</p>
            {onClose && (
              <button className="orders-close-btn" onClick={onClose}>
                ×
              </button>
            )}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="empty-orders-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Your order history will appear here</p>
          </div>
        ) : (
          <div className="orders-content">
            {orderGroups.map(([orderDate, orderItems]) => {
              const orderTotal = calculateOrderTotal(orderItems)
              const totalItems = calculateOrderItems(orderItems)
              const formattedDate = new Date(orderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })

              return (
                <div key={orderDate} className="order-group">
                  <div className="order-group-header">
                    <div className="order-group-info">
                      <h3 className="order-date">Ordered on {formattedDate}</h3>
                      <p className="order-items-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                    </div>
                    <div className="order-group-total">
                      <span className="order-total-label">Total:</span>
                      <span className="order-total-amount">₹{orderTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    {orderItems.map((item) => {
                      const itemPrice = item.hasDiscount ? item.discountedPrice : item.price
                      const itemTotal = itemPrice * item.quantity

                      return (
                        <div key={`${item.orderId}-${item.id}`} className="order-item">
                          <div className="order-item-image">
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : (
                              <div className="order-item-placeholder">🏺</div>
                            )}
                            {item.hasDiscount && (
                              <div className="order-item-discount-badge">
                                {item.discountPercentage}% OFF
                              </div>
                            )}
                          </div>

                          <div className="order-item-details">
                            <h3 className="order-item-name">{item.name}</h3>
                            <div className="order-item-price-info">
                              {item.hasDiscount ? (
                                <div className="order-item-price-discounted">
                                  <span className="order-item-price-original">₹{item.price}</span>
                                  <span className="order-item-price-current">₹{itemPrice}</span>
                                </div>
                              ) : (
                                <span className="order-item-price-current">₹{itemPrice}</span>
                              )}
                            </div>
                            <div className="order-item-quantity">
                              Quantity: <strong>{item.quantity}</strong>
                            </div>
                            <div className="order-item-total">
                              Item Total: <strong>₹{itemTotal.toFixed(2)}</strong>
                            </div>
                          </div>

                          <div className="order-item-status">
                            <div className="order-status-badge order-status-placed">
                              <span className="status-icon">📦</span>
                              <span>Order Placed</span>
                            </div>
                            <p className="order-status-note">Cash on Delivery</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders

