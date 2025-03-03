// src/pages/Profile.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-elegant rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-primary/10">
          <h1 className="font-display text-2xl font-bold text-primary">Profile Information</h1>
        </div>
        <div className="divide-y divide-primary/10">
          <div className="px-6 py-6">
            <h3 className="text-sm font-medium text-primary/70">Full Name</h3>
            <p className="mt-2 font-body text-lg text-primary">{user?.name}</p>
          </div>
          <div className="px-6 py-6">
            <h3 className="text-sm font-medium text-primary/70">Email Address</h3>
            <p className="mt-2 font-body text-lg text-primary">{user?.email}</p>
          </div>
          <div className="px-6 py-6">
            <h3 className="text-sm font-medium text-primary/70">College ID</h3>
            <p className="mt-2 font-body text-lg text-primary">{user?.collegeId}</p>
          </div>
          <div className="px-6 py-6">
            <h3 className="text-sm font-medium text-primary/70">Account Type</h3>
            <p className="mt-2 font-body text-lg text-primary capitalize">{user?.role}</p>
          </div>
          <div className="px-6 py-6">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500 text-white font-body font-medium rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}