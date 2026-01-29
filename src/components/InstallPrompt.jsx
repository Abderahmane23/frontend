import React, { useEffect, useState } from 'react';
import './InstallPrompt.css';
import addIcon from '../assets/icons/icons8-plus-math-24.png';
import appLogo from '../assets/AppIconResizer/128x128.png';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsIOS(iOS);
    setIsMobile(mobile);

    // Check if already installed
    const installedFlag = localStorage.getItem('pwa-installed') === 'true';
    const dismissedFlag = localStorage.getItem('pwa-dismissed') === 'true';
    const standalone =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator && window.navigator.standalone === true);
    
    if (installedFlag || standalone) {
      localStorage.setItem('pwa-installed', 'true');
      setVisible(false);
      return;
    }

    // Don't show if dismissed
    if (dismissedFlag) {
      setVisible(false);
      return;
    }

    // For iOS, show custom prompt
    if (iOS) {
      setVisible(true);
      return;
    }

    // For Android/Chrome, wait for beforeinstallprompt
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    
    const onAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setVisible(false);
      setDeferredPrompt(null);
    };
    
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    try {
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setVisible(false);
      }
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', 'true');
    setVisible(false);
  };

  const handleCloseModal = () => {
    setShowIOSModal(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="install-banner">
        <div className="install-icon">
          <img src={addIcon} alt="Ajouter" />
        </div>
        <div className="install-text">
          <div className="install-title">Ajouter à l'écran d'accueil</div>
          <div className="install-sub">Installez l'app pour un accès rapide</div>
        </div>
        <div className="install-actions">
          <button className="install-btn" onClick={handleInstall}>
            Ajouter
          </button>
          <button className="install-dismiss" onClick={handleDismiss} aria-label="Fermer">
            ✕
          </button>
        </div>
      </div>

      {/* iOS Installation Modal */}
      {showIOSModal && (
        <div className="ios-modal-overlay" onClick={handleCloseModal}>
          <div className="ios-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ios-modal-close" onClick={handleCloseModal}>✕</button>
            <h2>📱 Installer sur iOS</h2>
            <div className="ios-instructions">
              <div className="ios-step">
                <div className="ios-step-number">1</div>
                <div className="ios-step-text">
                  Appuyez sur le bouton <strong>Partager</strong> 
                  <span className="ios-share-icon">⎘</span> en bas de Safari
                </div>
              </div>
              <div className="ios-step">
                <div className="ios-step-number">2</div>
                <div className="ios-step-text">
                  Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong>
                </div>
              </div>
              <div className="ios-step">
                <div className="ios-step-number">3</div>
                <div className="ios-step-text">
                  Appuyez sur <strong>"Ajouter"</strong> en haut à droite
                </div>
              </div>
            </div>
            <button className="ios-got-it-btn" onClick={handleCloseModal}>
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
