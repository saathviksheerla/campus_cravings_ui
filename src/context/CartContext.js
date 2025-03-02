// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthenticationContext';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'campus-cravings-cart';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  
  // Load cart from localStorage on component mount or when user changes
  useEffect(() => {
    const loadCart = () => {
      if (user) {
        try {
          const savedCart = localStorage.getItem(`${CART_STORAGE_KEY}-${user._id}`);
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          } else {
            setCartItems([]);
          }
        } catch (error) {
          console.error('Error parsing cart data', error);
          setCartItems([]);
        }
      } else {
        // For guest users or when no user is logged in
        try {
          const guestCart = localStorage.getItem(`${CART_STORAGE_KEY}-guest`);
          if (guestCart) {
            setCartItems(JSON.parse(guestCart));
          } else {
            setCartItems([]);
          }
        } catch (error) {
          console.error('Error parsing guest cart data', error);
          setCartItems([]);
        }
      }
      setIsCartLoaded(true);
    };

    loadCart();
  }, [user]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Only save cart after initial load to prevent overwriting with empty array
    if (isCartLoaded) {
      if (user) {
        localStorage.setItem(`${CART_STORAGE_KEY}-${user._id}`, JSON.stringify(cartItems));
      } else {
        localStorage.setItem(`${CART_STORAGE_KEY}-guest`, JSON.stringify(cartItems));
      }
    }
  }, [cartItems, user, isCartLoaded]);
  
  // Transfer guest cart to user cart on login
  useEffect(() => {
    if (user && isCartLoaded) {
      const guestCart = localStorage.getItem(`${CART_STORAGE_KEY}-guest`);
      if (guestCart && guestCart !== '[]') {
        const guestCartItems = JSON.parse(guestCart);
        // Merge with any existing user cart
        const userCart = localStorage.getItem(`${CART_STORAGE_KEY}-${user._id}`);
        if (userCart) {
          const userCartItems = JSON.parse(userCart);
          // Merge logic - add guest items to user cart
          const mergedCart = [...userCartItems];
          
          guestCartItems.forEach(guestItem => {
            const existingItemIndex = mergedCart.findIndex(item => item._id === guestItem._id);
            if (existingItemIndex !== -1) {
              // Update quantity if item already exists
              mergedCart[existingItemIndex].quantity += guestItem.quantity;
            } else {
              // Add new item
              mergedCart.push(guestItem);
            }
          });
          
          setCartItems(mergedCart);
        } else {
          // No existing user cart, just use guest cart
          setCartItems(guestCartItems);
        }
        
        // Clear guest cart
        localStorage.removeItem(`${CART_STORAGE_KEY}-guest`);
      }
    }
  }, [user, isCartLoaded]);
  
  const addToCart = (item, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      
      if (existingItem) {
        // If item already exists, update quantity
        return prevItems.map(i => 
          i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        // Otherwise add new item
        return [...prevItems, { ...item, quantity }];
      }
    });
  };
  
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
  };
  
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCartItems([]);
    if (user) {
      localStorage.removeItem(`${CART_STORAGE_KEY}-${user._id}`);
    } else {
      localStorage.removeItem(`${CART_STORAGE_KEY}-guest`);
    }
  };
  
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  
  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount
    }}>
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