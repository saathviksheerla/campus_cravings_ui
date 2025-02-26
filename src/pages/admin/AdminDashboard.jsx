// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalMenuItems: 0,
    todaysOrders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Get orders
      const ordersResponse = await api.get('/orders/admin/all');
      const pendingOrders = ordersResponse.data.filter(order => 
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      ).length;
      
      // Calculate today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysOrders = ordersResponse.data.filter(order => 
        new Date(order.orderDate) >= today
      ).length;
      
      // Calculate revenue (from completed orders)
      const revenue = ordersResponse.data
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0);
      
      // Get menu items
      const menuResponse = await api.get('/menu');
      const totalMenuItems = menuResponse.data.length;
      
      setStats({ pendingOrders, totalMenuItems, todaysOrders, revenue });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.pendingOrders}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Menu Items</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalMenuItems}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Today's Orders</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.todaysOrders}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{stats.revenue.toFixed(2)}</dd>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
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

      {stats.pendingOrders > 0 && (
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have {stats.pendingOrders} pending orders that need attention.
                <a href="/admin/orders" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-2">
                  View orders
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}