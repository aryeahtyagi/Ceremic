import React from 'react'
import './App.css'

function App() {
  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🏺</span>
            <span className="logo-text">Ceremic</span>
          </div>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#collection">Collection</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <button className="cart-btn">
            <span>🛒</span>
            <span className="cart-count">0</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Handcrafted Ceramics
              <span className="title-accent"> for Modern Living</span>
            </h1>
            <p className="hero-description">
              Discover our exquisite collection of handcrafted ceramics, 
              where traditional artistry meets contemporary design. 
              Each piece tells a story of craftsmanship and elegance.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">Explore Collection</button>
              <button className="btn btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="ceramic-showcase">
              <div className="ceramic-item ceramic-1"></div>
              <div className="ceramic-item ceramic-2"></div>
              <div className="ceramic-item ceramic-3"></div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Handcrafted</h3>
            <p>Each piece is carefully crafted by skilled artisans</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌿</div>
            <h3>Eco-Friendly</h3>
            <p>Made with sustainable materials and processes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Unique Designs</h3>
            <p>One-of-a-kind pieces for your home</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Free Shipping</h3>
            <p>Complimentary shipping on orders over $50</p>
          </div>
        </div>
      </section>

      {/* Collection Preview */}
      <section className="collection-preview" id="collection">
        <div className="section-header">
          <h2>Featured Collection</h2>
          <p>Curated pieces that blend beauty with functionality</p>
        </div>
        <div className="collection-grid">
          <div className="product-card">
            <div className="product-image product-1"></div>
            <div className="product-info">
              <h3>Terracotta Vase</h3>
              <p className="product-category">Decorative</p>
              <p className="product-price">$45</p>
            </div>
          </div>
          <div className="product-card">
            <div className="product-image product-2"></div>
            <div className="product-info">
              <h3>Ceramic Dinner Set</h3>
              <p className="product-category">Dining</p>
              <p className="product-price">$120</p>
            </div>
          </div>
          <div className="product-card">
            <div className="product-image product-3"></div>
            <div className="product-info">
              <h3>Hand-painted Bowl</h3>
              <p className="product-category">Kitchen</p>
              <p className="product-price">$35</p>
            </div>
          </div>
          <div className="product-card">
            <div className="product-image product-4"></div>
            <div className="product-info">
              <h3>Modern Planter</h3>
              <p className="product-category">Garden</p>
              <p className="product-price">$55</p>
            </div>
          </div>
        </div>
        <button className="btn btn-outline">View All Products</button>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="about-container">
          <div className="about-image">
            <div className="about-visual"></div>
          </div>
          <div className="about-content">
            <h2>Our Story</h2>
            <p>
              Ceremic was born from a passion for traditional craftsmanship 
              and modern aesthetics. We work directly with skilled artisans 
              to bring you unique, high-quality ceramics that enhance your 
              living space.
            </p>
            <p>
              Every piece in our collection is carefully selected for its 
              quality, design, and ability to bring warmth and character 
              to your home.
            </p>
            <button className="btn btn-primary">Read More</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Space?</h2>
          <p>Browse our complete collection and find the perfect pieces for your home</p>
          <button className="btn btn-primary btn-large">Shop Now</button>
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
              <li>Email: hello@ceremic.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Artisan St, Craft City</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="Facebook">👥</a>
              <a href="#" aria-label="Pinterest">📌</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Ceremic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App


