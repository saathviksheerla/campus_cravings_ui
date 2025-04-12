// src/pages/Profile.jsx
import React, { useState } from 'react';
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-elegant rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-primary/10">
          <h1 className="font-display text-2xl font-bold text-primary">Profile Information</h1>
        </div>
        <div className="divide-y divide-primary/10">
          {/* Username Section with Edit Functionality */}
          <div className="px-6 py-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-primary/70">Username</h3>
              {!isEditingUsername && (
                <button
                  type="button"
                  onClick={() => setIsEditingUsername(true)}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
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
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new username"
                    disabled={isLoading}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
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
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <p className="mt-2 font-body text-lg text-primary">{user?.name}</p>
                {successMessage && (
                  <p className="mt-1 text-green-500 text-sm">{successMessage}</p>
                )}
              </>
            )}
          </div>

          {/* Email Address Section */}
          <div className="px-6 py-6">
            <h3 className="text-sm font-medium text-primary/70">Email Address</h3>
            <p className="mt-2 font-body text-lg text-primary">{user?.email}</p>
          </div>

          {/* Account Type Section (for admins) */}
          {user?.role === 'admin' && (
            <div className="px-6 py-6">
              <h3 className="text-sm font-medium text-primary/70">Account Type</h3>
              <p className="mt-2 font-body text-lg text-primary capitalize">{user?.role}</p>
            </div>
          )}

          {/* Logout Button */}
          <div className="px-6 py-6">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500 text-white font-body font-medium rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}