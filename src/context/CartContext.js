// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthenticationContext';
import { useCollege } from './CollegeContext';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'campus-cravings-cart';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { selectedCollege, isCollegeSelected } = useCollege();
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  
  // Load cart from localStorage on component mount or when user/college changes
  useEffect(() => {
    const loadCart = () => {
      // Don't load cart if no college is selected
      if (!selectedCollege || !isCollegeSelected) {
        setCartItems([]);
        setIsCartLoaded(true);
        return;
      }

      const collegeId = selectedCollege._id;
      
      if (user) {
        try {
          const savedCart = localStorage.getItem(`${CART_STORAGE_KEY}-${user._id}-${collegeId}`);
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
          const guestCart = localStorage.getItem(`${CART_STORAGE_KEY}-guest-${collegeId}`);
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
  }, [user, selectedCollege, isCollegeSelected]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Only save cart after initial load and if college is selected
    if (isCartLoaded && selectedCollege && isCollegeSelected) {
      const collegeId = selectedCollege._id;
      
      if (user) {
        localStorage.setItem(`${CART_STORAGE_KEY}-${user._id}-${collegeId}`, JSON.stringify(cartItems));
      } else {
        localStorage.setItem(`${CART_STORAGE_KEY}-guest-${collegeId}`, JSON.stringify(cartItems));
      }
    }
  }, [cartItems, user, selectedCollege, isCollegeSelected, isCartLoaded]);
  
  // Transfer guest cart to user cart on login (only for selected college)
  useEffect(() => {
    if (user && isCartLoaded && selectedCollege && isCollegeSelected) {
      const collegeId = selectedCollege._id;
      const guestCart = localStorage.getItem(`${CART_STORAGE_KEY}-guest-${collegeId}`);
      
      if (guestCart && guestCart !== '[]') {
        const guestCartItems = JSON.parse(guestCart);
        // Merge with any existing user cart for this college
        const userCart = localStorage.getItem(`${CART_STORAGE_KEY}-${user._id}-${collegeId}`);
        
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
          // No existing user cart for this college, just use guest cart
          setCartItems(guestCartItems);
        }
        
        // Clear guest cart for this college
        localStorage.removeItem(`${CART_STORAGE_KEY}-guest-${collegeId}`);
      }
    }
  }, [user, isCartLoaded, selectedCollege, isCollegeSelected]);
  
  const addToCart = (item, quantity = 1) => {
    // Don't add to cart if no college is selected
    if (!selectedCollege || !isCollegeSelected) {
      console.warn('Cannot add to cart: No college selected');
      return;
    }

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
    
    if (selectedCollege && isCollegeSelected) {
      const collegeId = selectedCollege._id;
      
      if (user) {
        localStorage.removeItem(`${CART_STORAGE_KEY}-${user._id}-${collegeId}`);
      } else {
        localStorage.removeItem(`${CART_STORAGE_KEY}-guest-${collegeId}`);
      }
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