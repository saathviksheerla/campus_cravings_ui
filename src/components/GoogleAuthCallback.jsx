// src/components/GoogleAuthCallback.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';
import toast from 'react-hot-toast';

export default function GoogleAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      login(token);
      toast.success('Successfully logged in!');
      navigate('/menu');
    } else if (error) {
      toast.error(`Authentication failed: ${error}`);
      navigate('/login');
    } else {
      toast.error('Authentication failed');
      navigate('/login');
    }
  }, [location, login, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-lg font-medium">Completing authentication...</p>
      </div>
    </div>
  );
}