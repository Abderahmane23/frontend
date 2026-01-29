// src/pages/Bestsellers.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBestsellers } from '../services/api.js';
import './Bestsellers.css';

export default function Bestsellers() {
  const navigate = useNavigate();
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBestsellers = async () => {
      try {
        setLoading(true);
        const data = await fetchBestsellers();
        setBestsellers(data);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement bestsellers:', err);
        setError('Impossible de charger les meilleures ventes');
      } finally {
        setLoading(false);
      }
    };

    loadBestsellers();
  }, []);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/300?text=Image+Indisponible';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  if (loading) {
    return (
      <div className="bestsellers-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Retour
          </button>
          <h1 className="page-title">Meilleures Ventes</h1>
        </div>
        
        <div className="bestsellers-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bestseller-item skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bestsellers-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Retour
          </button>
          <h1 className="page-title">Meilleures Ventes</h1>
        </div>
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bestsellers-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Retour
        </button>
        <h1 className="page-title">Meilleures Ventes</h1>
        <p className="page-subtitle">
          {bestsellers.length} produit{bestsellers.length > 1 ? 's' : ''} les plus vendus
        </p>
      </div>

      <div className="bestsellers-grid">
        {bestsellers.map((item) => (
          <div key={item._id} className="bestseller-item">
            <div className="bestseller-badge">⭐ Bestseller</div>
            <div className="bestseller-image-wrapper">
              <img
                src={item.image_url || 'https://via.placeholder.com/300?text=No+Image'}
                alt={item.name}
                onError={handleImageError}
                draggable={false}
                className="bestseller-image"
              />
            </div>
            <div className="bestseller-content">
              <h3 className="bestseller-title">{item.name}</h3>
              {item.description && (
                <p className="bestseller-description">{item.description}</p>
              )}
              <div className="bestseller-footer">
                <div className="bestseller-price">
                  {formatPrice(item.price)} <span className="currency">GNF</span>
                </div>
                <button className="add-to-cart-btn">
                  🛒 Ajouter
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bestsellers.length === 0 && !loading && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <p className="no-results-text">Aucune meilleure vente disponible</p>
        </div>
      )}
    </div>
  );
}
