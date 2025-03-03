// src/components/MobileBottomNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';
import { useCart } from '../context/CartContext';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { getCartItemsCount } = useCart();
  const location = useLocation();
  const cartItemsCount = getCartItemsCount();

  // Don't show the bottom nav on admin pages
  if (user?.role === 'admin' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-primary/90 backdrop-blur-lg text-secondary z-50 border-t border-primary/20">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/menu" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 ${
            location.pathname === '/menu' ? 'text-accent' : 'text-secondary'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs">Menu</span>
        </Link>
        
        {user && (
          <Link 
            to="/orders" 
            className={`flex flex-col items-center space-y-1 px-3 py-2 ${
              location.pathname === '/orders' ? 'text-accent' : 'text-secondary'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs">Orders</span>
          </Link>
        )}
        
        <Link 
          to="/" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 ${
            location.pathname === '/' ? 'text-accent' : 'text-secondary'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </Link>
        
        <Link 
          to="/cart" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 relative ${
            location.pathname === '/cart' ? 'text-accent' : 'text-secondary'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemsCount}
            </span>
          )}
          <span className="text-xs">Cart</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center space-y-1 px-3 py-2 ${
            location.pathname === '/profile' ? 'text-accent' : 'text-secondary'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </div>
  );
}