import React, { useState } from 'react'
import './LoginSignup.css'
import { createUser, loginUser } from '../services/api'
import { saveUserData } from '../utils/userStorage'

function LoginSignup({ onLoginSuccess, onClose }) {
  const [mode, setMode] = useState('signup') // 'signup' or 'login'
  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    email: '',
    address: '',
    pincode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const validateSignupForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required')
      return false
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.address.trim()) {
      setError('Address is required')
      return false
    }
    if (!formData.pincode.trim()) {
      setError('Pincode is required')
      return false
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    // Basic phone validation (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }

    // Basic pincode validation (6 digits)
    const pincodeRegex = /^\d{6}$/
    if (!pincodeRegex.test(formData.pincode.trim())) {
      setError('Please enter a valid 6-digit pincode')
      return false
    }

    return true
  }

  const validateLoginForm = () => {
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required')
      return false
    }

    // Basic phone validation (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }

    return true
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (!validateSignupForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const userData = await createUser({
        username: formData.username.trim(),
        phoneNumber: formData.phoneNumber.replace(/\D/g, ''),
        email: formData.email.trim(),
        address: formData.address.trim(),
        pincode: formData.pincode.trim()
      })

      // Check if user already exists (null response)
      if (userData === null) {
        // Switch to login mode
        setMode('login')
        setError('Account already exists. Please login with your phone number.')
        setLoading(false)
        return
      }

      // Save user data to localStorage
      saveUserData(userData)

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(userData)
      }
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!validateLoginForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const userData = await loginUser(formData.phoneNumber.replace(/\D/g, ''))

      // Save user data to localStorage
      saveUserData(userData)

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(userData)
      }
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your phone number and try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    if (mode === 'login') {
      handleLogin(e)
    } else {
      handleSignup(e)
    }
  }

  const switchToLogin = () => {
    setMode('login')
    setError('')
  }

  const switchToSignup = () => {
    setMode('signup')
    setError('')
  }

  return (
    <div className="login-signup-overlay" onClick={onClose}>
      <div className="login-signup-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        <div className="login-signup-content">
          <div className="login-signup-header">
            <h2>{mode === 'login' ? 'Login' : 'Create Account'}</h2>
            <p>{mode === 'login' ? 'Enter your phone number to continue' : 'Sign up to continue shopping'}</p>
          </div>

          {error && (
            <div className="login-error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-signup-form">
            {mode === 'signup' && (
              <>
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your complete address"
                    required
                    disabled={loading}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter your 6-digit pincode"
                    required
                    disabled={loading}
                    maxLength="6"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your 10-digit phone number"
                required
                disabled={loading}
                maxLength="10"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-submit-login"
              disabled={loading}
            >
              {loading 
                ? (mode === 'login' ? 'Logging in...' : 'Creating Account...') 
                : (mode === 'login' ? 'Login' : 'Create Account')
              }
            </button>

            <div className="login-signup-switch">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    className="switch-link"
                    onClick={switchToSignup}
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    className="switch-link"
                    onClick={switchToLogin}
                    disabled={loading}
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup

