import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { items, total, count, clearCart } = useCart();
  const PHONE_NUMBER = '610438208';
  const [deliveryOption, setDeliveryOption] = useState('pickup'); // 'pickup' or 'delivery'

  const openDialer = () => {
    window.location.href = `tel:${PHONE_NUMBER}`;
  };

  const generateCartMessage = () => {
    const deliveryFee = deliveryOption === 'delivery' ? 50000 : 0;
    const finalTotal = total + deliveryFee;
    
    let message = "Bonjour, je suis intéressé par ces articles:%0A%0A";
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product_name}%0A`;
      message += `   Quantité: ${item.quantity}%0A`;
      message += `   Prix: ${(item.price || 0).toLocaleString('fr-FR')} GNF%0A%0A`;
    });
    
    message += `*Total des articles:* ${total.toLocaleString('fr-FR')} GNF%0A`;
    
    if (deliveryOption === 'delivery') {
      message += `*Frais de livraison:* 50,000 GNF%0A`;
    }
    
    message += `*Total final:* ${finalTotal.toLocaleString('fr-FR')} GNF%0A%0A`;
    message += `*Option:* ${deliveryOption === 'delivery' ? 'Livraison à domicile' : 'Je passe chercher'}`;
    
    return message;
  };

  const handleWhatsAppContact = () => {
    const message = generateCartMessage();
    const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCheckout = () => {
    const deliveryFee = deliveryOption === 'delivery' ? 50000 : 0;
    const order = {
      date: new Date().toISOString(),
      delivery: deliveryOption === 'delivery',
      items: items.map(it => ({
        _id: it._id,
        product_name: it.product_name,
        quantity: it.quantity,
        price: it.price
      })),
      total: total + deliveryFee
    };
    localStorage.setItem('lastOrder', JSON.stringify(order));
    clearCart();
    navigate('/purchases');
  };

  return (
    <div className="page-container" style={{marginLeft: '5px'}}>
      <h1>Panier</h1>
      {count === 0 ? (
        <>
          <p>Votre panier est actuellement vide.</p>
          <button 
            className="btn btn-primary" 
            style={{marginTop: '1rem'}}
            onClick={() => navigate('/')}
          >
            Continuer le Shopping
          </button>
        </>
      ) : (
        <>
          <div style={{marginTop: '1rem'}}>
            {items.map(it => (
              <div key={it._id} style={{display:'flex',justifyContent:'space-between',padding:'0.5rem 0',borderBottom:'1px solid #eee'}}>
                <div>
                  <div style={{fontWeight:600}}>{it.product_name}</div>
                  <div style={{fontSize:'0.9rem',color:'#555'}}>Qté: {it.quantity}</div>
                </div>
                <div style={{fontWeight:700}}>{(it.quantity * (it.price || 0)).toLocaleString('fr-FR')} GNF</div>
              </div>
            ))}
          </div>
          
          <div style={{marginTop:'1rem',display:'flex',justifyContent:'space-between'}}>
            <span style={{fontWeight:600}}>Total articles</span>
            <span style={{fontWeight:700}}>{total.toLocaleString('fr-FR')} GNF</span>
          </div>

          {/* Delivery Options */}
          <div style={{marginTop:'1.5rem',padding:'1rem',background:'#f8f9fa',borderRadius:'8px'}}>
            <h3 style={{fontSize:'1rem',fontWeight:700,marginBottom:'0.75rem'}}>Options de récupération</h3>
            
            <label style={{display:'flex',alignItems:'center',padding:'0.75rem',background:'white',borderRadius:'6px',marginBottom:'0.5rem',cursor:'pointer',border: deliveryOption === 'pickup' ? '2px solid #007bff' : '2px solid #e0e0e0'}}>
              <input
                type="radio"
                name="deliveryOption"
                value="pickup"
                checked={deliveryOption === 'pickup'}
                onChange={(e) => setDeliveryOption(e.target.value)}
                style={{marginRight:'0.75rem',width:'18px',height:'18px',cursor:'pointer'}}
              />
              <span style={{fontSize:'0.95rem',fontWeight:600}}>Je passe chercher</span>
            </label>

            <label style={{display:'flex',alignItems:'center',padding:'0.75rem',background:'white',borderRadius:'6px',cursor:'pointer',border: deliveryOption === 'delivery' ? '2px solid #007bff' : '2px solid #e0e0e0'}}>
              <input
                type="radio"
                name="deliveryOption"
                value="delivery"
                checked={deliveryOption === 'delivery'}
                onChange={(e) => setDeliveryOption(e.target.value)}
                style={{marginRight:'0.75rem',width:'18px',height:'18px',cursor:'pointer'}}
              />
              <div style={{flex:1}}>
                <span style={{fontSize:'0.95rem',fontWeight:600}}>On me livre</span>
                <span style={{fontSize:'0.85rem',color:'#666',marginLeft:'0.5rem'}}>(+50,000 GNF)</span>
              </div>
            </label>
          </div>

          {deliveryOption === 'delivery' && (
            <div style={{marginTop:'0.5rem',padding:'0.75rem',background:'#e8f5e9',borderRadius:'6px',fontSize:'0.9rem',color:'#2e7d32'}}>
              <strong>Total avec livraison:</strong> {(total + 50000).toLocaleString('fr-FR')} GNF
            </div>
          )}

          {/* Action Buttons */}
          <div style={{marginTop:'1.5rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            <button 
              className="btn btn-whatsapp"
              onClick={handleWhatsAppContact}
              style={{
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              📱 Contact WhatsApp
            </button>

            <button 
              className="btn btn-call"
              onClick={openDialer}
              style={{
                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              📞 Appel mobile
            </button>

            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/')}
              style={{
                background: '#6c757d',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Continuer mes achats
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
