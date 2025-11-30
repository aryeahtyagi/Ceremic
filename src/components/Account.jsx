import React from 'react'
import './Account.css'
import { getUserData, clearUserData } from '../utils/userStorage'

function Account({ onClose, onLoginClick }) {
  const userData = getUserData()
  const isLoggedIn = userData !== null

  const handleLogout = () => {
    clearUserData()
    if (onClose) {
      onClose()
    }
    // Reload page to update navbar state
    window.location.reload()
  }

  return (
    <div className="account-overlay" onClick={onClose}>
      <div className="account-modal" onClick={(e) => e.stopPropagation()}>
        <button className="account-close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        <div className="account-content">
          {isLoggedIn ? (
            <>
              <div className="account-header">
                <div className="account-avatar">
                  <span>{userData.username?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <h2>My Account</h2>
                <p className="account-welcome">Welcome back, {userData.username || 'User'}!</p>
              </div>

              <div className="account-details">
                <div className="account-detail-item">
                  <span className="detail-label">Username</span>
                  <span className="detail-value">{userData.username || 'N/A'}</span>
                </div>
                
                <div className="account-detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{userData.email || 'N/A'}</span>
                </div>
                
                <div className="account-detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{userData.phoneNumber || 'N/A'}</span>
                </div>
                
                <div className="account-detail-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{userData.address || 'N/A'}</span>
                </div>
                
                <div className="account-detail-item">
                  <span className="detail-label">Pincode</span>
                  <span className="detail-value">{userData.pincode || 'N/A'}</span>
                </div>
              </div>

              <div className="account-actions">
                <button 
                  className="btn btn-primary btn-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="account-header">
                <div className="account-icon">👤</div>
                <h2>Account</h2>
                <p className="account-welcome">Please login to view your account details</p>
              </div>

              <div className="account-login-prompt">
                <p>You need to be logged in to access your account information.</p>
                <button 
                  className="btn btn-primary btn-login-account"
                  onClick={() => {
                    if (onClose) onClose()
                    if (onLoginClick) onLoginClick()
                  }}
                >
                  Login / Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Account

