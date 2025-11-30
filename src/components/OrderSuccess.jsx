import React, { useEffect } from 'react'
import './OrderSuccess.css'

function OrderSuccess({ onClose }) {
  useEffect(() => {
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      if (onClose) onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="order-success-overlay" onClick={onClose}>
      <div className="order-success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-animation-container">
          <div className="success-checkmark">
            <div className="checkmark-circle">
              <div className="checkmark-check"></div>
            </div>
          </div>
          <div className="confetti">
            {Array.from({ length: 30 }).map((_, i) => {
              const randomX = Math.random()
              const randomY = Math.random()
              const randomDelay = Math.random() * 0.5
              const randomDuration = 1.5 + Math.random() * 1
              return (
                <div 
                  key={i} 
                  className={`confetti-piece confetti-${i % 5}`}
                  style={{
                    '--random-x': randomX,
                    '--random-y': randomY,
                    '--random-delay': `${randomDelay}s`,
                    '--random-duration': `${randomDuration}s`
                  }}
                ></div>
              )
            })}
          </div>
        </div>
        
        <div className="success-content">
          <h2 className="success-title">🎉 Order Placed Successfully! 🎉</h2>
          <p className="success-message">
            Thank you for your order! We're preparing your beautiful ceramics with care.
          </p>
          <p className="success-details">
            You will receive a confirmation shortly. Your order will be delivered via Cash on Delivery.
          </p>
        </div>

        <button className="btn btn-success-close" onClick={onClose}>
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

export default OrderSuccess

