// src/pages/Admin/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <button
          onClick={() => navigate('/admin/menu')}
          className="p-6 bg-white shadow rounded-lg hover:bg-gray-50"
        >
          <h3 className="text-lg font-medium text-gray-900">Manage Menu</h3>
          <p className="mt-2 text-sm text-gray-500">Add, edit, or remove menu items</p>
        </button>
        <button
          onClick={() => navigate('/admin/orders')}
          className="p-6 bg-white shadow rounded-lg hover:bg-gray-50"
        >
          <h3 className="text-lg font-medium text-gray-900">Manage Orders</h3>
          <p className="mt-2 text-sm text-gray-500">View and update order status</p>
        </button>
        <button
          onClick={() => navigate('/admin/analytics')}
          className="p-6 bg-white shadow rounded-lg hover:bg-gray-50"
        >
          <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
          <p className="mt-2 text-sm text-gray-500">View sales and order statistics</p>
        </button>
        <button
          onClick={() => navigate('/admin/settings')}
          className="p-6 bg-white shadow rounded-lg hover:bg-gray-50"
        >
          <h3 className="text-lg font-medium text-gray-900">Settings</h3>
          <p className="mt-2 text-sm text-gray-500">Configure system settings</p>
        </button>
      </div>
    </div>
  );
}