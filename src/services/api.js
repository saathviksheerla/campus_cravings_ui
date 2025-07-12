// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
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

// Phone verification
export const updatePhone = (data) => api.post('/phone/update', data);
export const verifyPhone = (data) => api.post('/phone/verify', data);
export const checkPhoneStatus = () => api.get('/phone/status');

// Profile
export const getUserProfile = () => api.get('/user/profile');
export const updateUsername = (data) => api.post('/user/update-username', data);

// Menu
export const getMenu = (collegeId) => api.post('/menu', {collegeId});
export const getCategories = () => api.get('/menu/categories');
export const createMenuItem = (data) => api.post('/menu/add', data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// Orders
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = () => api.get('/orders');
export const getAdminOrders = () => api.get('/orders/admin/all');
export const updateOrderStatus = (orderId, status) => api.put(`/orders/admin/${orderId}/status`, { status });

export default api;