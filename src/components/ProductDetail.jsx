import React from 'react'
import './ProductDetail.css'

function ProductDetail({ product, onClose, onAddToCart }) {
  if (!product) return null

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="product-detail-content">
          <div className="product-detail-image">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="product-image-large"
              />
            ) : (
              <div className="product-image-large product-image-placeholder-large">
                <span>🏺</span>
              </div>
            )}
          </div>
          <div className="product-detail-info">
            <h2>{product.name}</h2>
            <p className="product-detail-price">₹{product.price}</p>
            <p className="product-detail-description">{product.description}</p>
            <div className="product-detail-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => {
                  onAddToCart(product)
                  onClose()
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

