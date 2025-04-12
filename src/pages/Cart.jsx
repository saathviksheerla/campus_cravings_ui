// src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthenticationContext';
import { createOrder, checkPhoneStatus } from '../services/api';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Check phone verification status when component mounts and when user changes
  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return;
      
      try {
        setIsCheckingStatus(true);
        const response = await checkPhoneStatus();
        setIsPhoneVerified(response.data.isPhoneVerified);
      } catch (error) {
        console.error('Error checking phone verification:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    
    checkVerification();
  }, [user]);

  const handleQuantityChange = (item, newQuantity) => {
    updateQuantity(item._id, parseInt(newQuantity));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    // Check phone verification status before placing order
    if (!isPhoneVerified) {
      toast.error('Phone verification required before placing orders');
      navigate('/profile');
      return;
    }

    try {
      setIsPlacingOrder(true);
      
      // Format items for the API
      const orderItems = cartItems.map(item => ({
        menuItemId: item._id,
        quantity: item.quantity
      }));
      
      await createOrder({ items: orderItems });
      
      // Clear cart after successful order
      clearCart();
      
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Order error:', error);
      
      // Special handling for verification errors
      if (error.response?.data?.verificationNeeded) {
        toast.error('Phone verification required before placing orders');
        navigate('/profile');
      } else {
        toast.error(error.response?.data?.error || 'Failed to place order');
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-primary">Your Cart</h1>
          <p className="mt-4 font-body text-primary/70">Your cart is empty</p>
          <button
            onClick={() => navigate('/menu')}
            className="mt-8 px-6 py-3 bg-accent text-primary font-body font-medium rounded-md hover:bg-accent-dark transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-primary">Your Cart</h1>
      
      {/* Show phone verification warning if user is logged in but phone is not verified */}
      {user && !isCheckingStatus && !isPhoneVerified && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium text-yellow-700">
              Phone verification required for placing orders
            </p>
          </div>
          <p className="mt-1 ml-7 text-sm text-yellow-600">
            You must verify your phone number before you can place orders.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="mt-2 ml-7 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Verify Now →
          </button>
        </div>
      )}
      
      <div className="mt-8 space-y-6">
        {cartItems.map(item => (
          <div key={item._id} className="bg-white shadow-elegant rounded-lg overflow-hidden">
            <div className="p-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-display text-xl text-primary">{item.name}</h3>
                  <p className="text-primary/70 font-body">{item.description}</p>
                  <p className="font-body font-medium text-primary">₹{item.price}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    className="px-3 py-1 bg-primary/10 rounded-l-md text-primary"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item, e.target.value)}
                    className="w-12 text-center border-y border-primary/10 py-1 font-body"
                  />
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    className="px-3 py-1 bg-primary/10 rounded-r-md text-primary"
                  >
                    +
                  </button>
                </div>
                
                <p className="font-body font-medium text-primary">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
                
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-white shadow-elegant rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl font-bold text-primary">Order Summary</h3>
            <button
              onClick={() => clearCart()}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Clear Cart
            </button>
          </div>
          
          <div className="mt-4 space-y-2 divide-y divide-primary/10">
            {cartItems.map(item => (
              <div key={item._id} className="flex justify-between py-2">
                <p className="font-body text-primary">
                  {item.quantity}x {item.name}
                </p>
                <p className="font-body text-primary">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
            
            <div className="flex justify-between py-4">
              <p className="font-body font-bold text-primary">Total</p>
              <p className="font-body font-bold text-primary">
                ₹{getCartTotal().toFixed(2)}
              </p>
            </div>
          </div>
          
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || (user && !isPhoneVerified)}
            className="mt-6 w-full py-3 bg-accent text-primary font-body font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {isPlacingOrder ? 'Placing Order...' : 
             (user && !isPhoneVerified) ? 'Phone Verification Required' : 
             'Place Order'}
          </button>
          
          {user && !isPhoneVerified && (
            <p className="mt-2 text-center text-sm text-red-600">
              Please verify your phone number in your profile before placing an order
            </p>
          )}
        </div>
      </div>
    </div>
  );
}