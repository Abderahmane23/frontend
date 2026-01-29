import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNavbar.css';

import homeIcon from '../assets/icons/icons8-home-24.png';
import mapIcon from '../assets/icons/icons8-map-24.png';
import cartIcon from '../assets/icons/icons8-shopping-cart-24.png';
import profileIcon from '../assets/icons/icons8-profile-24.png';
import scanIcon from '../assets/icons/icons8-image-file-add-48.png';
import { useCart } from '../context/CartContext';

const BottomNavbar = () => {
  const { count } = useCart();
  return (
    <nav className="bottom-navbar" aria-label="Bottom navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="icon-container">
          <img src={homeIcon} alt="Accueil" />
        </span>
        <span className="nav-label">Accueil</span>
      </NavLink>

      <NavLink
        to="/maps"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="icon-container">
          <img src={mapIcon} alt="Carte" />
        </span>
        <span className="nav-label">Carte</span>
      </NavLink>

      <NavLink
        to="/scan"
        className={({ isActive }) => `nav-item scan-item ${isActive ? 'active' : ''}`}
      >
        <span className="scan-button" aria-label="Scanner">
          <img src={scanIcon} alt="Scanner" />
        </span>
        <span className="nav-label">Scanner</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="icon-container">
          <img src={cartIcon} alt="Panier" />
        </span>
        {count > 0 && <span className="cart-badge">{count}</span>}
        <span className="nav-label">Panier</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="icon-container">
          <img src={profileIcon} alt="Profil" />
        </span>
        <span className="nav-label">Profil</span>
      </NavLink>
    </nav>
  );
};

export default BottomNavbar;
