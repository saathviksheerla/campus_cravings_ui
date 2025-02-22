// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary/90 text-secondary backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center">
              <span className="text-xl font-display font-bold text-accent">College Cravings</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/menu" className="inline-flex items-center px-1 pt-1 text-secondary hover:text-accent transition-colors">
                Menu
              </Link>
              {user && user.role === 'client' && (
                <Link to="/orders" className="inline-flex items-center px-1 pt-1 text-secondary hover:text-accent transition-colors">
                  Orders
                </Link>
              )}
              {user && user.role === 'admin' && (
                <Link to="/admin" className="inline-flex items-center px-1 pt-1 text-secondary hover:text-accent transition-colors">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-secondary hover:text-accent transition-colors">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-accent hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-primary transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}