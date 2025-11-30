import React, { useState, useEffect } from 'react'
import { fetchCollections, transformCollectionsData } from '../services/api'
import './Home.css'

function Home({ onNavigateToCollections, onViewProduct }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiData = await fetchCollections()
        const transformedData = transformCollectionsData(apiData)
        // Show first 8 products on home page
        setProducts(transformedData.slice(0, 8))
      } catch (err) {
        console.error('Failed to load products:', err)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])
  return (
    <>
      {/* Hero Section - Ceramic Themed */}
      <section className="hero-home" id="home">
        <div className="ceramic-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
        </div>
        <div className="hero-content-home">
          <div className="hero-text-home">
            <div className="handcrafted-badge">
              <span className="badge-icon">✋</span>
              <span>Handcrafted with Care</span>
            </div>
            <h1 className="hero-title-home">
              Handcrafted Ceramics
              <span className="title-accent"> for Your Home</span>
            </h1>
            <p className="hero-description-home">
              Discover unique, handcrafted pieces that bring elegance and warmth to your space. 
              Each piece tells a story of traditional craftsmanship.
            </p>
            <button className="btn btn-primary btn-hero" onClick={onNavigateToCollections}>
              Explore Collection
            </button>
          </div>
          <div className="hero-visual-home">
            <div className="ceramic-showcase-container">
              <div className="ceramic-mug ceramic-mug-1">
                <div className="mug-handle"></div>
                <div className="mug-pattern"></div>
              </div>
              <div className="ceramic-bowl ceramic-bowl-2">
                <div className="bowl-flower"></div>
                <div className="bowl-flower bowl-flower-2"></div>
                <div className="bowl-flower bowl-flower-3"></div>
              </div>
              <div className="ceramic-plate ceramic-plate-1">
                <div className="plate-pattern"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="clay-texture-overlay"></div>
      </section>

      {/* Products Section - Main Focus */}
      <section className="products-showcase" id="collection">
        <div className="section-header">
          <h2>Our Collection</h2>
          <p>Handcrafted ceramics for every space</p>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
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
            <div className="products-grid-home">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card-home"
                  onClick={() => {
                    if (onViewProduct) {
                      onViewProduct(product)
                    } else {
                      onNavigateToCollections()
                    }
                  }}
                >
                  <div 
                    className="product-image-home"
                    style={{
                      backgroundImage: product.image ? `url(${product.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: product.image ? 'transparent' : 'var(--accent-color)'
                    }}
                  >
                    {!product.image && (
                      <div className="product-image-placeholder-home">🏺</div>
                    )}
                  </div>
                  <div className="product-info-home">
                    <h3>{product.name}</h3>
                    <div className="product-price-container-home">
                      {product.hasDiscount ? (
                        <div>
                          <span className="product-price-original-home">₹{product.price}</span>
                          <span className="product-price-discounted-home">₹{product.discountedPrice}</span>
                          <span className="product-discount-badge-home">{product.discountPercentage}% OFF</span>
                        </div>
                      ) : (
                        <p className="product-price-home">₹{product.price}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-section">
              <button className="btn btn-primary btn-large" onClick={onNavigateToCollections}>
                View All Products
              </button>
            </div>
          </>
        )}
      </section>

      {/* Quick Features - Minimal */}
      <section className="quick-features">
        <div className="features-minimal">
          <div className="feature-minimal">
            <span className="feature-icon-minimal">🚚</span>
            <span>Free Shipping</span>
          </div>
          <div className="feature-minimal">
            <span className="feature-icon-minimal">↩️</span>
            <span>Easy Returns</span>
          </div>
          <div className="feature-minimal">
            <span className="feature-icon-minimal">✓</span>
            <span>Authentic</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🏺</span>
              <span className="logo-text">Ceremic</span>
            </div>
            <p>Handcrafted ceramics for modern living</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#collection">Collection</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>Email: svrvehome@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Ceremic. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

export default Home

