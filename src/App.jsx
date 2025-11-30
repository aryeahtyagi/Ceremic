import React, { useState, useEffect, useCallback } from 'react'
import './App.css'
import Collections from './components/Collections'
import ProductDetailPage from './components/ProductDetailPage'
import Home from './components/Home'
import LoginSignup from './components/LoginSignup'
import Account from './components/Account'
import Cart from './components/Cart'
import Orders from './components/Orders'
import { fetchCollections, transformCollectionsData, updateCartItem, loadUserCart } from './services/api'
import { isUserLoggedIn, getUserData, getUserId } from './utils/userStorage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [products, setProducts] = useState([])
  const [showLoginSignup, setShowLoginSignup] = useState(false)
  const [pendingAddToCart, setPendingAddToCart] = useState(null)
  const [showAccount, setShowAccount] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(isUserLoggedIn())
  const [userData, setUserData] = useState(getUserData())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchCollections()
        const transformedProducts = transformCollectionsData(data)
        setProducts(transformedProducts)
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }
    loadProducts()
  }, [])

  // Load cart on mount if user is logged in
  useEffect(() => {
    const loadCart = async () => {
      if (!isLoggedIn) {
        setCart([])
        return
      }

      const userData = getUserData()
      if (!userData) {
        setCart([])
        return
      }

      try {
        const cartData = await loadUserCart(userData)
        
        // Match cart items with product details
        const products = transformCollectionsData(cartData.ceremics || [])
        const cartWithProducts = (cartData.cart || []).map(cartItem => {
          const product = products.find(p => p.id === cartItem.productId)
          if (product) {
            return {
              ...product,
              quantity: cartItem.quantity
            }
          }
          return null
        }).filter(item => item !== null)

        setCart(cartWithProducts)
      } catch (error) {
        console.error('Error loading cart:', error)
        setCart([])
      }
    }

    loadCart()
  }, [isLoggedIn])

  // Check URL parameters on mount and when products are loaded
  useEffect(() => {
    const loadProductFromUrl = async (productId) => {
      try {
        let productList = products
        if (productList.length === 0) {
          const data = await fetchCollections()
          productList = transformCollectionsData(data)
          setProducts(productList)
        }
        const product = productList.find(p => p.id === productId)
        if (product) {
          setSelectedProductId(productId)
          setSelectedProduct(product)
          setCurrentPage('product-detail')
        } else {
          // Product not found, redirect to collections
          setCurrentPage('collections')
          setSelectedProductId(null)
          setSelectedProduct(null)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        setCurrentPage('collections')
      }
    }

    const urlParams = new URLSearchParams(window.location.search)
    const productIdParam = urlParams.get('productId')
    
    if (productIdParam) {
      const productId = parseInt(productIdParam)
      if (!isNaN(productId)) {
        loadProductFromUrl(productId)
      }
    }
  }, [products]) // Re-run when products are loaded

  // Handle browser back/forward buttons and URL changes
  useEffect(() => {
    const loadProductFromUrl = async (productId) => {
      try {
        let productList = products
        if (productList.length === 0) {
          const data = await fetchCollections()
          productList = transformCollectionsData(data)
          setProducts(productList)
        }
        const product = productList.find(p => p.id === productId)
        if (product) {
          setSelectedProductId(productId)
          setSelectedProduct(product)
          setCurrentPage('product-detail')
        } else {
          setCurrentPage('collections')
          setSelectedProductId(null)
          setSelectedProduct(null)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        setCurrentPage('collections')
      }
    }

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const productIdParam = urlParams.get('productId')
      
      if (productIdParam) {
        const productId = parseInt(productIdParam)
        if (!isNaN(productId)) {
          loadProductFromUrl(productId)
        }
      } else {
        setCurrentPage('home')
        setSelectedProductId(null)
        setSelectedProduct(null)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [products])

  // Helper function to get cart item quantity
  const getCartQuantity = (productId) => {
    const cartItem = cart.find(item => item.id === productId)
    return cartItem ? cartItem.quantity : 0
  }

  // Helper function to check if product is in cart
  const isProductInCart = (productId) => {
    return cart.some(item => item.id === productId)
  }

  const handleAddToCart = async (product) => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      // Store the product to add after login
      setPendingAddToCart(product)
      // Show login/signup modal
      setShowLoginSignup(true)
      return
    }

    const userId = getUserId()
    if (!userId) {
      console.error('User ID not found')
      return
    }

    try {
      // Get current quantity from cart or default to 0
      const existingItem = cart.find(item => item.id === product.id)
      const currentQuantity = existingItem ? existingItem.quantity : 0
      const newQuantity = currentQuantity + 1

      // Call API to update cart
      const cartItem = await updateCartItem(userId, product.id, newQuantity)

      // Update local cart state based on API response
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id)
        if (existingItem) {
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: cartItem.quantity }
              : item
          )
        } else {
          return [...prevCart, { ...product, quantity: cartItem.quantity }]
        }
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      // Optionally show error message to user
    }
  }

  const handleIncreaseQuantity = async (productId) => {
    const userId = getUserId()
    if (!userId) {
      console.error('User ID not found')
      return
    }

    try {
      // Get current quantity
      const existingItem = cart.find(item => item.id === productId)
      const currentQuantity = existingItem ? existingItem.quantity : 0
      const newQuantity = currentQuantity + 1

      // Call API to update cart
      const cartItem = await updateCartItem(userId, productId, newQuantity)

      // Update local cart state based on API response
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: cartItem.quantity }
            : item
        )
      )
    } catch (error) {
      console.error('Error increasing quantity:', error)
    }
  }

  const handleQuickAddSix = async (product) => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      // Store the product to add after login
      setPendingAddToCart(product)
      // Show login/signup modal
      setShowLoginSignup(true)
      return
    }

    const userId = getUserId()
    if (!userId) {
      console.error('User ID not found')
      return
    }

    try {
      // Get current quantity from cart or default to 0
      const existingItem = cart.find(item => item.id === product.id)
      const currentQuantity = existingItem ? existingItem.quantity : 0
      const newQuantity = currentQuantity + 6

      // Call API to update cart
      const cartItem = await updateCartItem(userId, product.id, newQuantity)

      // Update local cart state based on API response
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id)
        if (existingItem) {
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: cartItem.quantity }
              : item
          )
        } else {
          return [...prevCart, { ...product, quantity: cartItem.quantity }]
        }
      })
    } catch (error) {
      console.error('Error quick adding to cart:', error)
    }
  }

  const handleRemoveItem = async (productId) => {
    const userId = getUserId()
    if (!userId) {
      console.error('User ID not found')
      return
    }

    try {
      // Set quantity to 0 to remove item
      await updateCartItem(userId, productId, 0)
      
      // Remove from local cart state
      setCart(prevCart => prevCart.filter(item => item.id !== productId))
    } catch (error) {
      console.error('Error removing item from cart:', error)
    }
  }

  const handleDecreaseQuantity = async (productId) => {
    const userId = getUserId()
    if (!userId) {
      console.error('User ID not found')
      return
    }

    try {
      // Get current quantity
      const existingItem = cart.find(item => item.id === productId)
      const currentQuantity = existingItem ? existingItem.quantity : 1
      const newQuantity = Math.max(0, currentQuantity - 1)

      if (newQuantity === 0) {
        // Remove item from cart
        setCart(prevCart => prevCart.filter(item => item.id !== productId))
        // Still call API to update (quantity 0 might remove it on backend)
        await updateCartItem(userId, productId, 0)
      } else {
        // Call API to update cart
        const cartItem = await updateCartItem(userId, productId, newQuantity)

        // Update local cart state based on API response
        setCart(prevCart =>
          prevCart.map(item =>
            item.id === productId
              ? { ...item, quantity: cartItem.quantity }
              : item
          )
        )
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error)
    }
  }

  const handleLoginSuccess = async (userData) => {
    // Update login state and user data
    setIsLoggedIn(true)
    setUserData(userData)
    
    // Close login modal
    setShowLoginSignup(false)
    
    // Load cart from API
    try {
      const cartData = await loadUserCart(userData)
      
      // Match cart items with product details
      const products = transformCollectionsData(cartData.ceremics || [])
      const cartWithProducts = (cartData.cart || []).map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId)
        if (product) {
          return {
            ...product,
            quantity: cartItem.quantity
          }
        }
        return null
      }).filter(item => item !== null)

      setCart(cartWithProducts)
    } catch (error) {
      console.error('Error loading cart after login:', error)
      setCart([])
    }
    
    // If there was a pending add to cart, execute it now
    if (pendingAddToCart) {
      const userId = getUserId()
      if (userId) {
        try {
          const cartItem = await updateCartItem(userId, pendingAddToCart.id, 1)
          setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === pendingAddToCart.id)
            if (existingItem) {
              return prevCart.map(item =>
                item.id === pendingAddToCart.id
                  ? { ...item, quantity: cartItem.quantity }
                  : item
              )
            } else {
              return [...prevCart, { ...pendingAddToCart, quantity: cartItem.quantity }]
            }
          })
        } catch (error) {
          console.error('Error adding pending item to cart:', error)
        }
      }
      setPendingAddToCart(null)
    }
  }

  const handleCloseLoginSignup = () => {
    setShowLoginSignup(false)
    // Clear pending add to cart if user closes without logging in
    setPendingAddToCart(null)
  }

  const handleViewProduct = (product) => {
    setSelectedProductId(product.id)
    setSelectedProduct(product) // Store product data for passing to detail page
    setCurrentPage('product-detail')
    // Update URL without page reload
    window.history.pushState({}, '', `?productId=${product.id}`)
  }

  const handleViewProductFromHome = (product) => {
    handleViewProduct(product)
  }

  const handleCloseProductDetail = () => {
    setSelectedProductId(null)
    setSelectedProduct(null)
    setCurrentPage('collections')
    // Update URL to remove productId parameter
    window.history.pushState({}, '', window.location.pathname)
  }

  // Calculate total items in cart (sum of all quantities)
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  // Memoize cart update callback to prevent infinite loops
  const handleCartUpdate = useCallback((updatedCart) => {
    setCart(updatedCart)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.nav-container')) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [mobileMenuOpen])

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => {
            setCurrentPage('home')
            setMobileMenuOpen(false)
            window.history.pushState({}, '', window.location.pathname)
          }} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">🏺</span>
            <span className="logo-text">Svrve</span>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={mobileMenuOpen ? 'hamburger open' : 'hamburger'}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Desktop Menu */}
          <ul className="nav-menu">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); setCurrentPage('home') }}>Home</a></li>
            <li><a href="#collection" onClick={(e) => { 
              e.preventDefault(); 
              setCurrentPage('collections')
              window.history.pushState({}, '', window.location.pathname)
            }}>Collection</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); window.scrollTo({ top: document.getElementById('about')?.offsetTop - 80, behavior: 'smooth' }) }}>About</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); window.scrollTo({ top: document.getElementById('contact')?.offsetTop - 80, behavior: 'smooth' }) }}>Contact</a></li>
            {isLoggedIn && (
              <li><a href="#orders" onClick={(e) => { 
                e.preventDefault(); 
                setCurrentPage('orders')
                window.history.pushState({}, '', window.location.pathname)
              }}>My Orders</a></li>
            )}
          </ul>

          {/* Mobile Menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <ul className="mobile-nav-menu">
              <li><a href="#home" onClick={(e) => { 
                e.preventDefault(); 
                setCurrentPage('home')
                setMobileMenuOpen(false)
              }}>Home</a></li>
              <li><a href="#collection" onClick={(e) => { 
                e.preventDefault(); 
                setCurrentPage('collections')
                setMobileMenuOpen(false)
                window.history.pushState({}, '', window.location.pathname)
              }}>Collection</a></li>
              <li><a href="#about" onClick={(e) => { 
                e.preventDefault(); 
                setCurrentPage('home')
                setMobileMenuOpen(false)
                window.scrollTo({ top: document.getElementById('about')?.offsetTop - 80, behavior: 'smooth' })
              }}>About</a></li>
              <li><a href="#contact" onClick={(e) => { 
                e.preventDefault(); 
                setCurrentPage('home')
                setMobileMenuOpen(false)
                window.scrollTo({ top: document.getElementById('contact')?.offsetTop - 80, behavior: 'smooth' })
              }}>Contact</a></li>
              {isLoggedIn && (
                <li><a href="#orders" onClick={(e) => { 
                  e.preventDefault(); 
                  setCurrentPage('orders')
                  setMobileMenuOpen(false)
                  window.history.pushState({}, '', window.location.pathname)
                }}>My Orders</a></li>
              )}
            </ul>
          </div>

          <div className="nav-actions">
            <button 
              className={`account-btn ${isLoggedIn ? 'account-btn-logged-in' : ''}`}
              onClick={() => {
                setShowAccount(true)
                setMobileMenuOpen(false)
              }}
              title={isLoggedIn ? "My Account" : "Login / Sign Up"}
            >
              {isLoggedIn ? (
                <>
                  <span className="account-icon">👋</span>
                  <span className="account-icon-text account-text-mobile-hidden">Hi {userData?.username || 'User'}</span>
                </>
              ) : (
                <>
                  <span className="account-icon">👤</span>
                  <span className="account-icon-text account-text-mobile-hidden">Login</span>
                </>
              )}
            </button>
            <button 
              className="cart-btn"
              onClick={() => {
                setCurrentPage('cart')
                setMobileMenuOpen(false)
              }}
            >
              <span>🛒</span>
              <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </div>
      </nav>

      {currentPage === 'home' && (
        <Home 
          onNavigateToCollections={() => setCurrentPage('collections')}
          onViewProduct={handleViewProductFromHome}
        />
      )}

      {currentPage === 'collections' && (
        <Collections 
          onAddToCart={handleAddToCart}
          onViewProduct={handleViewProduct}
          cart={cart}
          onIncreaseQuantity={handleIncreaseQuantity}
          onDecreaseQuantity={handleDecreaseQuantity}
          onQuickAddSix={handleQuickAddSix}
        />
      )}

      {currentPage === 'product-detail' && (
        <ProductDetailPage
          productId={selectedProductId}
          product={selectedProduct}
          onClose={handleCloseProductDetail}
          onAddToCart={handleAddToCart}
          cart={cart}
          onIncreaseQuantity={handleIncreaseQuantity}
          onDecreaseQuantity={handleDecreaseQuantity}
          onQuickAddSix={handleQuickAddSix}
        />
      )}

      {currentPage === 'cart' && (
        <Cart
          cart={cart}
          onIncreaseQuantity={handleIncreaseQuantity}
          onDecreaseQuantity={handleDecreaseQuantity}
          onRemoveItem={handleRemoveItem}
          onClose={() => setCurrentPage('collections')}
          onCartUpdate={handleCartUpdate}
        />
      )}

      {currentPage === 'orders' && (
        <Orders
          onClose={() => setCurrentPage('home')}
        />
      )}

      {/* Login/Signup Modal */}
      {showLoginSignup && (
        <LoginSignup
          onLoginSuccess={handleLoginSuccess}
          onClose={handleCloseLoginSignup}
        />
      )}

      {/* Account Modal */}
      {showAccount && (
        <Account
          onClose={() => setShowAccount(false)}
          onLoginClick={() => {
            setShowAccount(false)
            setShowLoginSignup(true)
          }}
        />
      )}

      {/* Admin Section - Only accessible via direct URL */}
    </div>
  )
}

export default App


