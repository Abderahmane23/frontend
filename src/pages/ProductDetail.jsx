// src/pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppConfig } from '../config.js';
import './ProductDetail.css';
import callIcon from '../assets/icons/icons8-call-48.png';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, addToCartWithQuantity } = useCart();
  const [selectingQty, setSelectingQty] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(AppConfig.api(`/pieces/${id}`));
      
      if (!response.ok) {
        throw new Error('Produit non trouvé');
      }

      const json = await response.json();
      setProduct(json.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement du produit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCallClick = async () => {
    if (!product) return;

    // Open phone dialer (works on mobile)
    window.location.href = 'tel:610438208';
  };

  const getProductImage = (product) => {
    if (product?.image_url) return product.image_url;
    if (product?.image_filename) {
      return AppConfig.image(product.image_filename);
    }
    return 'https://via.placeholder.com/400?text=No+Image';
  };

  const handleAddToCart = () => {
    if (!product) return;
    setSelectingQty(true);
    setQuantity(1);
  };

  const maxQty = Math.max(0, Number(product?.quantite_disponible || 0));
  const decQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incQty = () => setQuantity((q) => Math.min(maxQty, q + 1));

  const handleValidate = () => {
    if (!product) return;
    const finalQty = Math.min(Math.max(1, quantity), maxQty || 1);
    if (addToCartWithQuantity) {
      addToCartWithQuantity(product, finalQty);
    } else {
      for (let i = 0; i < finalQty; i++) addToCart(product);
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
          <h1 className="detail-title">Détails du produit</h1>
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

  if (!product) return null;

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
          src={getProductImage(product)}
          alt={product.product_name}
          className="detail-main-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400?text=Image+Indisponible';
          }}
        />
      </div>

      {/* Informations produit */}
      <div className="detail-content">
        <h2 className="product-title">{product.product_name}</h2>
        
        <div className="product-price-large">
          {AppConfig.formatPrice(product.prix_unitaire_GNF)}/pièce
        </div>

        {/* Badges */}
        <div className="product-badges">
          {product.categorieId?.nom && (
            <span className="badge badge-category">
              {product.categorieId.nom}
            </span>
          )}
          <span className={`badge ${product.quantite_disponible > 0 ? 'badge-success' : 'badge-danger'}`}>
            {product.quantite_disponible > 0 
              ? `En stock (${product.quantite_disponible})` 
              : 'Rupture de stock'}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <div className="product-section">
            <h3>Description</h3>
            <p className="product-description">{product.description}</p>
          </div>
        )}

        {/* Informations techniques */}
        <div className="product-section">
          <h3>Informations techniques</h3>
          <div className="product-info-grid">
            {product.code_piece && (
              <div className="info-item">
                <span className="info-label">Code pièce</span>
                <span className="info-value">{product.code_piece}</span>
              </div>
            )}
            {product.marque && (
              <div className="info-item">
                <span className="info-label">Marque</span>
                <span className="info-value">{product.marque}</span>
              </div>
            )}
            {product.modele && (
              <div className="info-item">
                <span className="info-label">Modèle</span>
                <span className="info-value">{product.modele}</span>
              </div>
            )}
            {product.annee && (
              <div className="info-item">
                <span className="info-label">Année</span>
                <span className="info-value">{product.annee}</span>
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        {!selectingQty ? (
          <div className="action-buttons-row">
            <button 
              className="btn btn-discuter" 
              disabled={product.quantite_disponible === 0}
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
                disabled={maxQty <= 0}
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
