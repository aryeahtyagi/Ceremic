import React, { useEffect } from 'react'
import './ThankYou.css'

function ThankYou({ onRedirectToHome }) {
  useEffect(() => {
    // Redirect to home page after 2 seconds
    const timer = setTimeout(() => {
      if (onRedirectToHome) {
        onRedirectToHome()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [onRedirectToHome])

  return (
    <div className="thank-you-page">
      <div className="thank-you-container">
        <div className="thank-you-icon">✓</div>
        <h1 className="thank-you-title">Thank You!</h1>
        <p className="thank-you-message">
          Your order has been placed successfully.
        </p>
        <p className="thank-you-submessage">
          Redirecting to home page...
        </p>
      </div>
    </div>
  )
}

export default ThankYou

