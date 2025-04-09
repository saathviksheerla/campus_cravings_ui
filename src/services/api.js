// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth - Google SSO endpoints
export const getCurrentUser = () => api.get('/auth/me');

// Menu
export const getMenu = () => api.get('/menu');
export const createMenuItem = (data) => api.post('/menu', data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// Orders
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = () => api.get('/orders');
export const getAdminOrders = () => api.get('/orders/admin/all');
export const updateOrderStatus = (orderId, status) => api.put(`/orders/admin/${orderId}/status`, { status });

// User
export const getUserProfile = () => api.get('/users/me');

export default api;