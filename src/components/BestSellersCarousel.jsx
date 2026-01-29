// src/components/BestSellersCarousel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBestsellers } from '../services/api.js';
import './BestSellersCarousel.css';

export default function BestSellersCarousel() {
  const navigate = useNavigate();
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const loadBestsellers = async () => {
      try {
        setLoading(true);
        const data = await fetchBestsellers();
        setBestsellers(data);
      } catch (error) {
        console.error('Erreur chargement bestsellers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBestsellers();
  }, []);


  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/200?text=Image+Indisponible';
  };

  const handleBestsellerClick = (id) => {
    navigate(`/bestseller/${id}`);
  };

  if (loading) {
    return (
      <div className="bestsellers-section">
        <h2 className="bestsellers-title">Meilleurs ventes</h2>
        <div className="bestsellers-carousel">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bestseller-card skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!bestsellers || bestsellers.length === 0) {
    return null;
  }

  return (
    <div className="bestsellers-section">
      <h2 className="bestsellers-title">Meilleurs ventes</h2>
      
      <div className="bestsellers-grid">
        {bestsellers.map((item) => (
          <div 
            key={item._id} 
            className="bestseller-card"
            onClick={() => handleBestsellerClick(item._id)}
          >
            <div className="bestseller-image-container">
              <img 
                src={item.image_url || 'https://via.placeholder.com/200?text=No+Image'} 
                alt={item.name}
                onError={handleImageError}
                draggable={false}
              />
            </div>
            <div className="bestseller-info">
              <div className="bestseller-name">{item.name}</div>
              {item.price && (
                <div className="bestseller-price">
                  {new Intl.NumberFormat('fr-FR').format(item.price)} GNF
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
