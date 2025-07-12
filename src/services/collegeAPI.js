// src/services/collegeAPI.js
import api from './api';

// Get all active colleges
export const getColleges = () => api.get('/college/all');

// Update user's selected college
export const updateUserCollege = (collegeId) => api.put('/college/user/college', { collegeId });

// Get user's current college
export const getUserCollege = () => api.get('/college/user/college');