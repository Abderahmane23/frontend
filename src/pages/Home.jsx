// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEngines, fetchProducts, searchProducts } from '../services/api.js';
import { AppConfig } from '../config.js';
import './Home.css';
import InstallPrompt from '../components/InstallPrompt';
import BestSellersCarousel from '../components/BestSellersCarousel';
import logo from '../assets/AppIconResizer/256x256.png';

export default function Home() {
  const navigate = useNavigate();
  const [engines, setEngines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // --------------------
  // INITIALIZATION
  // --------------------
  // ENGINE LOADING
  // --------------------
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const list = await fetchEngines();
        setEngines(list);
        
        // Load all products for search
        const productsData = await fetchProducts(1, 100); // Get first 100 products
        setAllProducts(productsData.data || []);
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setError('Impossible de charger les produits');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // --------------------
  // SEARCH FUNCTIONALITY
  // --------------------
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      const results = searchProducts(allProducts, searchQuery);
      setSearchResults(results);
      setSearchLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, allProducts]);

  // --------------------
  // IMAGE PROTECTION (Lightweight)
  // --------------------
  useEffect(() => {
    const preventImageActions = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventImageActions);
    document.addEventListener('dragstart', preventImageActions);

    return () => {
      document.removeEventListener('contextmenu', preventImageActions);
      document.removeEventListener('dragstart', preventImageActions);
    };
  }, []);

  // --------------------
  // NAVIGATION
  // --------------------
  const goToEngineDetail = (engineId) => {
    navigate(`/engine/${engineId}`);
  };

  const getEngineImage = (engine) => {
    if (engine.image_url) return engine.image_url;
    return 'https://via.placeholder.com/300?text=Engine';
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/300?text=Image+Indisponible';
  };

  // --------------------
  // NAVIGATION
  // --------------------
  const goToProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // --------------------
  // RENDER
  // --------------------
  if (loading) {
    return (
      <div className="home-container">
        <div className="header">
          <div className="header-topbar">
            <div className="header-center">
              <h1 className="brand-title">Pièces Poids Lourd Guinée</h1>
            </div>
          </div>
        </div>
        <InstallPrompt />
        <div className="categories"></div>
        <div className="skeleton-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="header">
          <div className="header-topbar">
            <div className="header-center">
              <h1 className="brand-title">Pièces Poids Lourd Guinée</h1>
            </div>
          </div>
        </div>
        <InstallPrompt />
        <div className="no-results">
          <div className="no-results-icon">📦</div>
          <div className="no-results-text">Le catalogue est temporairement indisponible</div>
        </div>
      </div>
    );
  }

  const getProductImage = (product) => {
    if (product?.image_url) return product.image_url;
    if (product?.image_filename) {
      return AppConfig.image(product.image_filename);
    }
    return 'https://via.placeholder.com/300?text=No+Image';
  };

  return (
    <div className="home-container">
      {/* Header */}
      <div className="header">
        <div className="header-topbar">
          <div className="header-left">
            <img src={logo} alt="Logo" className="header-logo" />
          </div>
          <div className="header-center">
            <h1 className="brand-title">Pièces Poids Lourd Guinée</h1>
          </div>
          <div className="header-right">
            <button 
              className="burger-menu" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className="burger-line"></span>
              <span className="burger-line"></span>
              <span className="burger-line"></span>
            </button>
          </div>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="menu-content" onClick={(e) => e.stopPropagation()}>
            <button className="menu-close" onClick={() => setMenuOpen(false)}>✕</button>
            <nav className="menu-nav">
              <a href="/" onClick={() => setMenuOpen(false)}>Accueil</a>
              <a href="/cart" onClick={() => setMenuOpen(false)}>Panier</a>
              <a href="/profile" onClick={() => setMenuOpen(false)}>Profil</a>
              <a href="/purchases" onClick={() => setMenuOpen(false)}>Mes achats</a>
            </nav>
          </div>
        </div>
      )}

      <InstallPrompt />

      {/* Conditional Rendering Based on Search */}
      {!searchQuery ? (
        <>
          {/* Best Sellers Carousel - Only show when not searching */}
          <BestSellersCarousel />

          <div className="categories"></div>

          {/* Section Title for Engines */}
          <div className="section-header">
            <h2 className="section-title">Chercher par camion</h2>
          </div>

          {/* Engines Grid */}
          <div className="products-grid">
            {engines.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <div className="no-results-text">Aucun moteur disponible</div>
              </div>
            ) : (
              engines.map(e => (
                <div 
                  key={e._id} 
                  className="product-card" 
                  onClick={() => goToEngineDetail(e._id)}
                >
                  <div className="product-image-container">
                    <img 
                      src={getEngineImage(e)} 
                      alt={e.name}
                      onError={handleImageError}
                      draggable={false}
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-name">{e.name}</div>
                    {e.modelInfo && (
                      <div className="product-category">{e.modelInfo}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Search Results */}
          <div className="search-results-header">
            <h2 className="search-results-title">
              {searchLoading ? 'Recherche en cours...' : `${searchResults.length} résultat${searchResults.length > 1 ? 's' : ''} trouvé${searchResults.length > 1 ? 's' : ''}`}
            </h2>
          </div>

          <div className="products-grid">
            {searchLoading ? (
              <div className="skeleton-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line"></div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <div className="no-results-text">
                  Aucun produit trouvé pour "{searchQuery}"
                </div>
              </div>
            ) : (
              searchResults.map(product => (
                <div 
                  key={product._id} 
                  className="product-card" 
                  onClick={() => goToProduct(product._id)}
                >
                  <div className="product-image-container">
                    <img 
                      src={getProductImage(product)} 
                      alt={product.product_name}
                      onError={handleImageError}
                      draggable={false}
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.product_name}</div>
                    {product.prix_unitaire_GNF && (
                      <div className="product-price">
                        {AppConfig.formatPrice(product.prix_unitaire_GNF)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}