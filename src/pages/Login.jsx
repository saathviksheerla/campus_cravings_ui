// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';
import { login } from '../services/api';
import toast from 'react-hot-toast';
import AuthenticationLayout from '../components/layouts/AuthenticationLayout';

export default function Login() {
  const navigate = useNavigate();
  const { user, login: authLogin } = useAuth();
  const [formData, setFormData] = useState({ email: 'stu@clg.edu', password: '9441' });
  const [loading, setLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(formData);
      authLogin(response.data.token, response.data.user);
      toast.success('Welcome back!');
      navigate('/menu');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticationLayout 
      title="Welcome Back" 
      subtitle="Sign in to your account"
      linkText="Don't have an account? Sign up"
      linkUrl="/register"
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthenticationLayout>
  );
}