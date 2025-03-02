// src/pages/Register.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';
import { register } from '../services/api';
import toast from 'react-hot-toast';
import AuthenticationLayout from '../components/layouts/AuthenticationLayout';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegeId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await register(formData);
      login(response.data.token, response.data.user);
      toast.success('Welcome to Campus Cravings!');
      navigate('/menu');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticationLayout 
      title="Create Account" 
      subtitle="Join Campus Cravings today"
      linkText="Already have an account? Sign in"
      linkUrl="/login"
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border-2 border-primary/10 rounded-md px-4 py-2 font-body focus:border-accent focus:ring-0"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full border-2 border-primary/10 rounded-md px-4 py-2 font-body focus:border-accent focus:ring-0"
            />
          </div>
          <div>
            <label htmlFor="collegeId" className="block text-sm font-medium text-primary">
              College ID
            </label>
            <input
              id="collegeId"
              name="collegeId"
              type="text"
              required
              value={formData.collegeId}
              onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
              className="mt-1 block w-full border-2 border-primary/10 rounded-md px-4 py-2 font-body focus:border-accent focus:ring-0"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full border-2 border-primary/10 rounded-md px-4 py-2 font-body focus:border-accent focus:ring-0"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-primary font-body font-medium py-3 rounded-md hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </AuthenticationLayout>
  );
}
