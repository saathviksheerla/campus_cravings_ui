// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';
import axios from 'axios'; // Make sure axios is installed

export default function Profile() {
  const baseURL = process.env.REACT_APP_API_URL;
  const { user, updateUserInContext } = useAuth();
  const navigate = useNavigate();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setError('');
  };

  const handleSubmitUsername = async (e) => {
    e.preventDefault();

    if (!username) {
      setError('Username cannot be empty');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await axios.post(`${baseURL}/user/update-username`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      
      // Update the user context with the updated user
      if (response.data.user) {
        updateUserInContext(response.data.user);
      }

      setSuccessMessage('Username updated successfully');
      setIsEditingUsername(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update username');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-primary min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-primary-light shadow-luxury rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-secondary/10">
            <h1 className="font-display text-2xl font-bold text-accent">Profile Information</h1>
          </div>
          <div className="divide-y divide-secondary/10">
            {/* Username Section with Edit Functionality */}
            <div className="px-6 py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-secondary/70">Username</h3>
                {!isEditingUsername && (
                  <button
                    type="button"
                    onClick={() => setIsEditingUsername(true)}
                    className="text-accent hover:text-accent-light text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingUsername ? (
                <form onSubmit={handleSubmitUsername} className="mt-2">
                  <div className="flex flex-col space-y-3">
                    <input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      className="px-3 py-2 bg-primary border border-secondary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-secondary"
                      placeholder="Enter new username"
                      disabled={isLoading}
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-accent text-primary rounded-md hover:bg-accent-light transition-colors disabled:bg-accent/50"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingUsername(false);
                          setUsername(user?.name || '');
                          setError('');
                        }}
                        className="px-4 py-2 bg-primary-dark text-secondary rounded-md hover:bg-primary transition-colors"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  <p className="mt-2 font-body text-lg text-secondary">{user?.name}</p>
                  {successMessage && (
                    <p className="mt-1 text-green-400 text-sm">{successMessage}</p>
                  )}
                </>
              )}
            </div>

            {/* Mobile Number Section */}
            {user?.phone && (
              <div className="px-6 py-6">
                <h3 className="text-sm font-medium text-secondary/70">Phone Number</h3>
                <p className="mt-2 font-body text-lg text-secondary">{user?.phone}</p>
              </div>
            )}

            {/* Email Address Section */}
            <div className="px-6 py-6">
              <h3 className="text-sm font-medium text-secondary/70">Email Address</h3>
              <p className="mt-2 font-body text-lg text-secondary">{user?.email}</p>
            </div>

            {/* Account Type Section (for admins) */}
            {user?.role === 'admin' && (
              <div className="px-6 py-6">
                <h3 className="text-sm font-medium text-secondary/70">Account Type</h3>
                <p className="mt-2 font-body text-lg text-secondary capitalize">{user?.role}</p>
              </div>
            )}

            {/* Logout Button */}
            <div className="px-6 py-6">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-primary-dark text-secondary font-body font-medium rounded-md hover:bg-primary border border-accent/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}