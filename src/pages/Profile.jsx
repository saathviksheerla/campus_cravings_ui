// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';
import { useCollege } from '../context/CollegeContext';
import axios from 'axios';
import * as collegeAPI from '../services/collegeAPI';

export default function Profile() {
  const baseURL = process.env.REACT_APP_API_URL;
  const { user, updateUserInContext } = useAuth();
  const { colleges, changeCollege } = useCollege();
  const navigate = useNavigate();
  
  // Username states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(user?.name || '');
  const [usernameError, setUsernameError] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState('');

  // College states
  const [isEditingCollege, setIsEditingCollege] = useState(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [currentCollege, setCurrentCollege] = useState(null);
  const [collegeError, setCollegeError] = useState('');
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [collegeSuccess, setCollegeSuccess] = useState('');

  const { logout } = useAuth();

  // Fetch current college on mount
  useEffect(() => {
    fetchCurrentCollege();
  }, []);

  const fetchCurrentCollege = async () => {
    try {
      const response = await collegeAPI.getUserCollege();
      setCurrentCollege(response.data.college);
      setSelectedCollegeId(response.data.college?._id || '');
    } catch (error) {
      console.error('Error fetching current college:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setUsernameError('');
  };

  const handleCollegeChange = (e) => {
    setSelectedCollegeId(e.target.value);
    setCollegeError('');
  };

  const handleSubmitUsername = async (e) => {
    e.preventDefault();

    if (!username) {
      setUsernameError('Username cannot be empty');
      return;
    }

    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return;
    }

    try {
      setUsernameLoading(true);
      setUsernameError('');

      const token = localStorage.getItem('token');
      const response = await axios.post(`${baseURL}/user/update-username`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      
      if (response.data.user) {
        updateUserInContext(response.data.user);
      }

      setUsernameSuccess('Username updated successfully');
      setIsEditingUsername(false);

      setTimeout(() => {
        setUsernameSuccess('');
      }, 3000);
    } catch (error) {
      setUsernameError(error.response?.data?.error || 'Failed to update username');
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleSubmitCollege = async (e) => {
    e.preventDefault();

    if (!selectedCollegeId) {
      setCollegeError('Please select a college');
      return;
    }

    try {
      setCollegeLoading(true);
      setCollegeError('');

      await changeCollege(selectedCollegeId);
      
      // Refresh current college data
      await fetchCurrentCollege();

      setCollegeSuccess('College updated successfully');
      setIsEditingCollege(false);

      setTimeout(() => {
        setCollegeSuccess('');
      }, 200);

      window.location.href = '/menu'; // Reload to reflect changes in menu

    } catch (error) {
      setCollegeError(error.response?.data?.error || 'Failed to update college');
    } finally {
      setCollegeLoading(false);
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
                      disabled={usernameLoading}
                    />
                    {usernameError && <p className="text-red-400 text-sm">{usernameError}</p>}
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-accent text-primary rounded-md hover:bg-accent-light transition-colors disabled:bg-accent/50"
                        disabled={usernameLoading}
                      >
                        {usernameLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingUsername(false);
                          setUsername(user?.name || '');
                          setUsernameError('');
                        }}
                        className="px-4 py-2 bg-primary-dark text-secondary rounded-md hover:bg-primary transition-colors"
                        disabled={usernameLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  <p className="mt-2 font-body text-lg text-secondary">{user?.name}</p>
                  {usernameSuccess && (
                    <p className="mt-1 text-green-400 text-sm">{usernameSuccess}</p>
                  )}
                </>
              )}
            </div>

            {/* College Section with Edit Functionality */}
            <div className="px-6 py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-secondary/70">College</h3>
                {!isEditingCollege && (
                  <button
                    type="button"
                    onClick={() => setIsEditingCollege(true)}
                    className="text-accent hover:text-accent-light text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingCollege ? (
                <form onSubmit={handleSubmitCollege} className="mt-2">
                  <div className="flex flex-col space-y-3">
                    <select
                      value={selectedCollegeId}
                      onChange={handleCollegeChange}
                      className="px-3 py-2 bg-primary border border-secondary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-secondary"
                      disabled={collegeLoading}
                    >
                      <option value="">Select a college</option>
                      {colleges.map((college) => (
                        <option key={college._id} value={college._id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                    {collegeError && <p className="text-red-400 text-sm">{collegeError}</p>}
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-accent text-primary rounded-md hover:bg-accent-light transition-colors disabled:bg-accent/50"
                        disabled={collegeLoading}
                      >
                        {collegeLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCollege(false);
                          setSelectedCollegeId(currentCollege?._id || '');
                          setCollegeError('');
                        }}
                        className="px-4 py-2 bg-primary-dark text-secondary rounded-md hover:bg-primary transition-colors"
                        disabled={collegeLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  <p className="mt-2 font-body text-lg text-secondary">
                    {currentCollege ? currentCollege.name : 'No college selected'}
                  </p>
                  {collegeSuccess && (
                    <p className="mt-1 text-green-400 text-sm">{collegeSuccess}</p>
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