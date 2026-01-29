// src/pages/BestsellerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppConfig } from '../config.js';
import './ProductDetail.css';
import { useCart } from '../context/CartContext';

export default function BestsellerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bestseller, setBestseller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, addToCartWithQuantity } = useCart();
  const [selectingQty, setSelectingQty] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchBestseller();
  }, [id]);

  const fetchBestseller = async () => {
    try {
      setLoading(true);
      const response = await fetch(AppConfig.api(`/bestsellers/${id}`));
      
      if (!response.ok) {
        throw new Error('Produit non trouvé');
      }

      const json = await response.json();
      setBestseller(json.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement du bestseller:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!bestseller) return;
    setSelectingQty(true);
    setQuantity(1);
  };

  const maxQty = 50; // Default max quantity for bestsellers
  const decQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incQty = () => setQuantity((q) => Math.min(maxQty, q + 1));

  const handleValidate = () => {
    if (!bestseller) return;
    const finalQty = Math.min(Math.max(1, quantity), maxQty);
    
    // Create a product-like object for cart
    const productForCart = {
      _id: bestseller._id,
      product_name: bestseller.name,
      prix_unitaire_GNF: bestseller.price,
      image_url: bestseller.image_url,
      description: bestseller.description
    };
    
    if (addToCartWithQuantity) {
      addToCartWithQuantity(productForCart, finalQty);
    } else {
      for (let i = 0; i < finalQty; i++) addToCart(productForCart);
    }
    setSelectingQty(false);
    navigate('/cart');
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="detail-header">
          <button className="back-button" disabled>← Retour</button>
        </div>
        <div className="detail-image-container">
          <div className="skeleton-image"></div>
        </div>
        <div className="detail-content">
          <div className="skeleton-line" style={{ width: '60%', height: 20, marginBottom: 12 }}></div>
          <div className="skeleton-line" style={{ width: '40%', height: 18, marginBottom: 24 }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: 14, marginBottom: 8 }}></div>
          <div className="skeleton-line" style={{ width: '90%', height: 14, marginBottom: 8 }}></div>
          <div className="skeleton-line" style={{ width: '80%', height: 14 }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-container">
        <div className="error-container">
          <div className="error">❌ {error}</div>
          <button onClick={() => navigate('/')} className="back-button">
            ← Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  if (!bestseller) return null;

  return (
    <div className="product-detail-container">
      {/* Header avec bouton retour */}
      <div className="detail-header">
        <button onClick={handleBack} className="back-button">
          ← Retour
        </button>
        {/* Favoris heart icon */}
        <div 
          className="favoris-heart-icon"
          onClick={() => setIsFavorited(!isFavorited)}
          title={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {isFavorited ? '♥' : '♡'}
        </div>
      </div>

      {/* Image principale */}
      <div className="detail-image-container">
        <img
          src={bestseller.image_url || 'https://via.placeholder.com/400?text=No+Image'}
          alt={bestseller.name}
          className="detail-main-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400?text=Image+Indisponible';
          }}
        />
      </div>

      {/* Informations produit */}
      <div className="detail-content">
        <h2 className="product-title">{bestseller.name}</h2>
        
        <div className="product-price-large">
          {AppConfig.formatPrice(bestseller.price)}/pièce
        </div>

        {/* Badges */}
        <div className="product-badges">
          <span className="badge badge-success">
            Bestseller
          </span>
          <span className="badge badge-success">
            En stock
          </span>
        </div>

        {/* Description */}
        {bestseller.description && (
          <div className="product-section">
            <h3>Description</h3>
            <p className="product-description">{bestseller.description}</p>
          </div>
        )}

        {/* Boutons d'action */}
        {!selectingQty ? (
          <div className="action-buttons-row">
            <button 
              className="btn btn-discuter" 
              onClick={handleAddToCart}
            >
              Discuter
            </button>
          </div>
        ) : (
          <>
            <div style={{textAlign:'center',marginBottom:'1rem',fontSize:'1.1rem',fontWeight:600,color:'#2c3e50'}}>
              Choisir la quantité
            </div>
            <div className="quantity-selector">
              <button className="qty-btn" onClick={decQty} disabled={quantity <= 1}>−</button>
              <div className="qty-value">{quantity}</div>
              <button className="qty-btn" onClick={incQty} disabled={quantity >= maxQty}>+</button>
            </div>
            <div className="action-buttons">
              <button 
                className="btn btn-primary" 
                onClick={handleValidate}
              >
                Valider
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
