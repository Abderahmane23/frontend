import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppConfig } from '../config.js';
import { fetchEngineDetails, fetchPiecesByEngine } from '../services/api.js';
import './EngineDetail.css';

export default function EngineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [engine, setEngine] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const init = async () => {
      try {
        const eng = await fetchEngineDetails(id);
        setEngine(eng);
        const pcs = await fetchPiecesByEngine(id);
        setPieces(pcs);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const goToPiece = (pieceId) => {
    navigate(`/product/${pieceId}`);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return <div className="engine-detail-container">Chargement…</div>;
  }

  if (!engine) {
    return <div className="engine-detail-container">Aucun moteur trouvé</div>;
  }

  return (
    <div className="engine-detail-container">
            <div className="detail-header">
        <button onClick={handleBack} className="back-button">
          ← Retour
        </button>
      </div>
              <div className="engine-image">
          <img src={engine.image_url || 'https://via.placeholder.com/400?text=Engine'} alt={engine.name} />
        </div>
      <div className="engine-header">
        <div className="engine-meta">
          <h1 className="engine-name">{engine.name}</h1>

         
        </div>
      </div>

      <div className="related-title">Pièces liées</div>
      <div className="related-grid">
        {pieces.length === 0 ? (
          <div className="no-related">Aucune pièce liée</div>
        ) : (
          pieces.map(p => (
            <div key={p._id} className="piece-card" onClick={() => goToPiece(p._id)}>
              <div className="piece-image">
                <img
                  src={p.image_url || 'https://via.placeholder.com/300?text=Image'}
                  alt={p.product_name || 'Pièce'}
                />
              </div>
              <div className="piece-info">
                <div className="piece-name">{p.product_name}</div>
                {typeof p.prix_unitaire_GNF === 'number' && (
                  <div className="piece-price">{AppConfig.formatPrice(p.prix_unitaire_GNF)}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
