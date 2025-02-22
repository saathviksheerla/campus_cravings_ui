// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';
import AdminNav from '../pages/admin/AdminNav';

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/menu" />;
  }

  return (
    <div>
      <AdminNav />
      {children}
    </div>
  );
};