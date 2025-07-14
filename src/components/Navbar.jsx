// src/components/Navbar.jsx
import {React, useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';
import { useCart } from '../context/CartContext';
import { getUserCollege } from '../services/collegeAPI';

export default function Navbar() {
  const { user } = useAuth();
  const { getCartItemsCount } = useCart();
  const cartItemsCount = getCartItemsCount();
  const [currentCollege, setCurrentCollege] = useState({});
  useEffect(() => {
      if(user){
        fetchCurrentCollege();
      }
    }, [user]);
  
    const fetchCurrentCollege = async () => {
      try {
        const res = await getUserCollege();
        setCurrentCollege(res.data.college);
      } catch (error) {
        console.error('Error fetching current college:', error);
      }
    };

  return (
    <nav className="sticky top-0 z-[1000] bg-primary/95 text-secondary backdrop-blur-lg shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* App Logo/Name - Always visible on all screens */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center">
              <span className="text-xl font-display font-bold text-accent drop-shadow-[0_0_8px_rgba(255,215,0,0.45)] shadow-accent-400/20">CampusCravings </span>
              {currentCollege?.code && (
                <>
                  <sup className="mx-1 my-1 text-sm font-display font-bold text-blue-100 transition-all duration-300 hover:shadow-blue-100/40 drop-shadow-[0_0_6px_rgba(219,234,254,0.4)] shadow-blue-100/20">x</sup>
                  <span className="text-xl font-display font-bold text-red-500 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] drop-shadow-[0_0_10px_rgba(239,68,68,0.55)]">{currentCollege?.code || ''}</span>
                </>
              )}
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/menu" className="inline-flex items-center px-1 pt-1 text-secondary hover:text-accent transition-colors font-body">
                Menu
              </Link>
              {user && user.role === 'client' && (
                <Link to="/orders" className="inline-flex items-center px-1 pt-1 text-secondary hover:text-accent transition-colors font-body">
                  Orders
                </Link>
              )}
              {user && user.role === 'admin' && (
                <Link to="/admin" className="inline-flex items-center px-1 pt-1 text-secondary hover:text-accent transition-colors font-body">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Desktop right navigation - Hidden on mobile */}
          {user ? (
            <div className="hidden sm:flex sm:items-center">
              <div className="flex items-center space-x-8">
                <Link to="/cart" className="relative text-secondary hover:text-accent transition-colors font-body">
                  <span className="text-secondary hover:text-accent transition-colors">Cart</span>
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="text-secondary hover:text-accent transition-colors font-body">
                  Profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex sm:items-center">
              <div className="flex items-center space-x-8">
                <Link to="/cart" className="relative text-secondary hover:text-accent transition-colors font-body">
                  <span className="text-secondary hover:text-accent transition-colors">Cart</span>
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/login"
                  className="m-2 px-4 py-2 w-fit h-fit border border-accent text-accent hover:bg-accent hover:text-primary transition-colors rounded-md font-body"
                >
                  Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}