import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cartItems');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);

  const count = items.reduce((sum, it) => sum + it.quantity, 0);
  const total = items.reduce((sum, it) => sum + it.quantity * (it.price || 0), 0);

  const addToCart = (product) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p._id === product._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...prev, { _id: product._id, product_name: product.product_name, price: product.prix_unitaire_GNF, quantity: 1 }];
    });
  };

  const addToCartWithQuantity = (product, qty) => {
    const quantity = Math.max(1, Number(qty || 1));
    setItems((prev) => {
      const idx = prev.findIndex((p) => p._id === product._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
        return copy;
      }
      return [...prev, { _id: product._id, product_name: product.product_name, price: product.prix_unitaire_GNF, quantity }];
    });
  };

  const clearCart = () => setItems([]);

  const value = useMemo(() => ({ items, count, total, addToCart, addToCartWithQuantity, clearCart }), [items, count, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
