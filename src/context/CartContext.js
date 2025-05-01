// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthenticationContext';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'campus-cravings-cart';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  useEffect(() => {
    const loadCart = () => {
      const key = user ? `${CART_STORAGE_KEY}-${user._id}` : `${CART_STORAGE_KEY}-guest`;
      const savedCart = localStorage.getItem(key);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing cart data:', e);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      setIsCartLoaded(true);
    };
    loadCart();
  }, [user]);

  useEffect(() => {
    if (isCartLoaded) {
      const key = user ? `${CART_STORAGE_KEY}-${user._id}` : `${CART_STORAGE_KEY}-guest`;
      localStorage.setItem(key, JSON.stringify(cartItems));
    }
  }, [cartItems, user, isCartLoaded]);

  useEffect(() => {
    if (user && isCartLoaded) {
      const guestCart = localStorage.getItem(`${CART_STORAGE_KEY}-guest`);
      if (guestCart && guestCart !== '[]') {
        const guestCartItems = JSON.parse(guestCart);
        const userCart = localStorage.getItem(`${CART_STORAGE_KEY}-${user._id}`);
        let mergedCart = guestCartItems;
        if (userCart) {
          const userCartItems = JSON.parse(userCart);
          mergedCart = [...userCartItems];
          guestCartItems.forEach(guestItem => {
            const existing = mergedCart.find(i => i._id === guestItem._id);
            if (existing) {
              existing.quantity += guestItem.quantity;
            } else {
              mergedCart.push(guestItem);
            }
          });
        }
        setCartItems(mergedCart);
        localStorage.removeItem(`${CART_STORAGE_KEY}-guest`);
      }
    }
  }, [user, isCartLoaded]);

  const addToCart = (item, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        return [...prev, { ...item, quantity }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item._id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    setCartItems(prev =>
      quantity <= 0
        ? prev.filter(i => i._id !== itemId)
        : prev.map(i => (i._id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    const key = user ? `${CART_STORAGE_KEY}-${user._id}` : `${CART_STORAGE_KEY}-guest`;
    localStorage.removeItem(key);
  };

  const getCartTotal = () => cartItems.reduce((t, i) => t + i.price * i.quantity, 0);

  const getCartItemsCount = () => cartItems.reduce((t, i) => t + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
