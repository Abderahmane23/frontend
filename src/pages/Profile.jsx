import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import profilePhoto from '../assets/drBrian.jpg';

const Profile = () => {
  const navigate = useNavigate();
  return (
    <div className="page-container profile-page">
      <div className="profile-header">
        <div className="avatar-container">
          <img src={profilePhoto} alt="Profile" className="avatar-image" />
        </div>
        <h2>Mamadi Bangoura</h2>
        <p className="address">📍 Sangoyah P.A</p>
        <p className="phone-number">📞 610333470</p>
      </div>
      <div className="profile-menu">
        <button className="menu-item" onClick={() => navigate('/purchases')}>Voir mes achats</button>
        <button className="menu-item">Modifier le Profil</button>
        <button className="menu-item">Paramètres</button>
        <button className="menu-item">Aide & Support</button>
        <button className="menu-item logout">Déconnexion</button>
      </div>
    </div>
  );
};

export default Profile;
