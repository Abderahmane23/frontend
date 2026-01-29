import React from 'react';
import './Notifications.css';

const Notifications = () => {
  return (
    <div className="page-container">
      <h1>Alertes</h1>
      <div className="notification-intro">
        <p>Ici vous pouvez surveiller vos commandes et confirmer que vous les avez reçues</p>
      </div>
      <div className="notification-list">
        {/* Notifications will appear here when available */}
        <div className="no-notifications">
          <span className="no-notif-icon">🔔</span>
          <p>Aucune notification pour le moment</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
