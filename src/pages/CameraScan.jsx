// src/pages/CameraScan.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppConfig } from '../config.js';
import './CameraScan.css';

export default function CameraScan() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const fileInputRef = useRef(null);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Test images for scanner
  const testImages = [
    { id: 1, name: 'Brake Pad', src: `${AppConfig.API_BASE_URL}/images/products/Brake.jpg` },
    { id: 2, name: 'Air Filter', src: `${AppConfig.API_BASE_URL}/images/products/Air.jpg` },
    { id: 3, name: 'Bearing', src: `${AppConfig.API_BASE_URL}/images/products/Bearing.jpg` },
    { id: 4, name: 'Clutch', src: `${AppConfig.API_BASE_URL}/images/products/Clutch.jpg` }
  ];

  // Handle test image selection
  const handleTestImageClick = (imageSrc) => {
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target.result);
          setError(null);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        setError('Erreur lors du chargement de l\'image de test');
      });
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image est trop volumineuse (max 10MB)');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target.result);
      setError(null);
    };
    reader.onerror = () => {
      setError('Erreur lors de la lecture du fichier');
    };
    reader.readAsDataURL(file);
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setIsLoading(false);
  };

  // Start camera
  const startCamera = async () => {
    setCameraActive(true);
    setIsLoading(true);
    setError(null);

    await new Promise(r => setTimeout(r, 0)); // ensure videoRef available

    try {
      if (stream) stream.getTracks().forEach(track => track.stop());

      const constraints = isMobile
        ? { video: { facingMode: { ideal: 'environment' }, width: 1920, height: 1080 }, audio: false }
        : { video: { width: 1280, height: 720 }, audio: false };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      videoRef.current.srcObject = mediaStream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      await videoRef.current.play();
      setStream(mediaStream);
      setIsLoading(false);

    } catch (err) {
      console.error('Camera error:', err);
      setError('Impossible d\'accéder à la caméra. ' + (err.message || ''));
      setCameraActive(false);
      setIsLoading(false);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
  };

  // Analyze captured image
  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setMatchedProducts([]);

    try {
      const response = await fetch(AppConfig.api('/image/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedImage.split(',')[1] }) // remove data:image prefix
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Erreur inconnue lors de l\'analyse');
      }

      // API returns: partNameFr, partNameEn, brandDetected, vehicleType, serialNumber, description, keywords
      setAnalysisResult(result.analysis);
      setMatchedProducts(result.matchedProducts || []);

      if (!result.matchedProducts || result.matchedProducts.length === 0) {
        setError('Aucun produit correspondant trouvé dans notre catalogue');
      }

    } catch (err) {
      console.error('Erreur analyse:', err);
      setError(err.message || 'Erreur lors de l\'analyse de l\'image. Réessayez.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setMatchedProducts([]);
    setError(null);
  };

  useEffect(() => () => stopCamera(), []); // cleanup on unmount

  const getProductImage = (product) => {
    if (product.image_url) return product.image_url;
    if (product.image_filename) return AppConfig.image(product.image_filename);
    return 'https://via.placeholder.com/200?text=No+Image';
  };

  return (
    <div className="camera-scan-container">
      {/* Header */}
      {!cameraActive && (
        <div className="scan-header">
          <button onClick={() => navigate('/')} className="back-btn">← Retour</button>
          <h1 className="scan-title">Scanner une Pièce</h1>
          <button onClick={() => setShowHelpModal(true)} className="help-btn">?</button>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="help-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowHelpModal(false)}>✕</button>
            <h2>💡 Comment utiliser le scanner</h2>
            <div className="help-content">
              <p><strong>1.</strong> Prenez une photo claire de la pièce automobile</p>
              <p><strong>2.</strong> Notre IA identifiera la pièce automatiquement</p>
              <p><strong>3.</strong> Trouvez des produits correspondants dans notre catalogue</p>
              <div className="help-tip">
                <span className="tip-icon">💡</span>
                <span>Astuce : Assurez-vous que la pièce est bien éclairée et visible</span>
              </div>
            </div>
            <button className="help-ok-btn" onClick={() => setShowHelpModal(false)}>Compris</button>
          </div>
        </div>
      )}

      {/* Initial view with buttons */}
      {!cameraActive && !capturedImage && !analysisResult && (
        <div className="initial-view">
          <div className="scan-options">
            <div className="button-row">
              <button onClick={startCamera} className="btn btn-primary btn-compact" disabled={isLoading}>
                {isLoading ? '⏳ Chargement...' : '📸 Prendre une Photo'}
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="btn btn-secondary btn-compact"
                disabled={isLoading}
              >
                📁 Choisir une Photo
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Test Images */}
          <div className="test-images-section">
            <h3>Ou testez avec ces images :</h3>
            <div className="test-images-grid">
              {testImages.map(img => (
                <div 
                  key={img.id} 
                  className="test-image-card"
                  onClick={() => handleTestImageClick(img.src)}
                >
                  <img src={img.src} alt={img.name} />
                  <p>{img.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera view */}
      {cameraActive && !capturedImage && (
        <div className="camera-view">
          <div className="video-container">
            <video ref={videoRef} autoPlay muted playsInline className="video-preview" />
            <div className="camera-overlay">
              <div className="focus-frame"></div>
              <div className="camera-hint">Centrez la pièce automobile dans le cadre</div>
            </div>
          </div>
          <div className="camera-controls">
            <button onClick={capturePhoto} className="btn btn-capture">📸 Capturer</button>
            <button onClick={stopCamera} className="btn btn-secondary">Annuler</button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Captured image + analyze */}
      {capturedImage && !analysisResult && (
        <div className="captured-view">
          <img src={capturedImage} alt="Captured" className="captured-image" />
          {isAnalyzing ? <p>🔍 Analyse en cours...</p> : (
            <div className="capture-actions">
              <button onClick={reset} className="btn btn-secondary">🔄 Reprendre</button>
              <button onClick={analyzeImage} className="btn btn-primary">🤖 Analyser avec l'IA</button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {analysisResult && (
        <div className="results-view">
          <div className="results-header">
            <h2>🤖 Résultat de l'Analyse IA</h2>
          </div>

          {/* Section 1: What is it? */}
          <div className="info-card info-what">
            <div className="card-header">
              <h3>🔍 Qu'est-ce que c'est ?</h3>
            </div>
            
            {/* Part Name */}
            <div className="analysis-part-name">
              <p className="part-name-fr">
                <strong>{analysisResult.partNameFr || 'Pièce non identifiée'}</strong>
              </p>
              {analysisResult.partNameEn && (
                <p className="part-name-en">({analysisResult.partNameEn})</p>
              )}
            </div>

            {/* Brand & Serial */}
            <div className="analysis-badges">
              {analysisResult.brandDetected && (
                <span className="badge badge-brand">🏷️ {analysisResult.brandDetected}</span>
              )}
              {analysisResult.vehicleType && (
                <span className="badge badge-vehicle">🚗 {analysisResult.vehicleType}</span>
              )}
              {analysisResult.serialNumber && (
                <span className="badge badge-serial">🔢 {analysisResult.serialNumber}</span>
              )}
            </div>

            {/* Description */}
            {analysisResult.description && (
              <div className="card-content">
                <p className="description-text">{analysisResult.description}</p>
              </div>
            )}
          </div>

          {/* Section 2: Where is it located? */}
          {analysisResult['part-location'] && (
            <div className="info-card info-location">
              <div className="card-header">
                <h3>📍 Où se trouve cette pièce ?</h3>
              </div>
              <div className="card-content">
                <p className="location-text">{analysisResult['part-location']}</p>
              </div>
            </div>
          )}

          {/* Section 3: How to replace? */}
          {analysisResult['Replacement-guide'] && (
            <div className="info-card info-replacement">
              <div className="card-header">
                <h3>🔧 Guide de Remplacement</h3>
              </div>
              <div className="card-content">
                <p className="replacement-text">{analysisResult['Replacement-guide']}</p>
                <div className="safety-note">
                  <span className="warning-icon">⚠️</span>
                  <em>Conseil : Si vous n'êtes pas sûr de vos compétences, consultez un mécanicien professionnel pour éviter tout risque.</em>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Matched Products */}
          {matchedProducts.length > 0 && (
            <div className="products-section">
              <h2 className="products-title">🛒 Produits Disponibles ({matchedProducts.length})</h2>
              <div className="matched-products-grid">
                {matchedProducts.map(p => (
                  <div key={p._id} className="matched-product-card" onClick={() => navigate(`/product/${p._id}`)}>
                    <img src={getProductImage(p)} alt={p.product_name} onError={e => e.target.src='https://via.placeholder.com/200?text=No+Image'} />
                    <div className="product-name">{p.product_name}</div>
                    <div className="product-price">{AppConfig.formatPrice(p.prix || p.prix_unitaire_GNF || 0)}</div>
                    {p.similarityScore && <div className="similarity-badge">{Math.round(p.similarityScore * 10)}% correspondance</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="results-actions">
            <button onClick={() => navigate('/')} className="btn btn-secondary">🏠 Accueil</button>
            <button onClick={reset} className="btn btn-primary">📸 Scanner Autre Pièce</button>
          </div>
        </div>
      )}

      {error && <div className="error-banner">⚠️ {error}</div>}
    </div>
  );
}
