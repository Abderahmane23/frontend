import React, { useState } from 'react';
import './Maps.css';
import mapsBg from '../assets/mapsimg.png';
import mapIcon from '../assets/icons/icons8-map-96.png';

const Maps = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="maps-page">
      <div className="maps-background">
        <img src={mapsBg} alt="Carte" />
      </div>

      <div className="maps-card">
        <div className="maps-card-header">
          <img src={mapIcon} alt="Carte" className="maps-icon" />
          <div className="maps-title">Voir tout les garages à proximité</div>
        </div>
        <div className="maps-sub">
          <span className="lock">🔒</span>
          <span>fonctionalité preemium</span>
        </div>
        <button className="maps-pro-btn" onClick={() => setShowModal(true)}>
          Passer à AutoMarket Pro
        </button>
      </div>

      {showModal && (
        <div className="maps-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="maps-modal" onClick={(e) => e.stopPropagation()}>
            <button className="maps-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2>votre carte arrive bientôt !</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maps;
