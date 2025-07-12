// src/context/CollegeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthenticationContext';
import * as collegeAPI from '../services/collegeAPI';

const CollegeContext = createContext(null);

export const CollegeProvider = ({ children }) => {
  const { user } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [isCollegeSelected, setIsCollegeSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  // Load colleges on mount
  useEffect(() => {
    loadColleges();
  }, []);

  // Handle college selection based on user login status
  useEffect(() => {
    const handleCollegeSelection = async () => {
      if (colleges.length === 0) return; // Wait for colleges to load

      //console.log(user);
      if (user) {
        // User is logged in - check if they have a selected college
        if (user.selectedCollegeId) {
          const userCollege = colleges.find(c => c._id === user.selectedCollegeId);
          if (userCollege) {
            setSelectedCollege(userCollege);
            setIsCollegeSelected(true);
            setShowPopup(false);
          } else {
            // User has invalid selectedCollegeId, show popup
            setIsCollegeSelected(false);
            setShowPopup(true);
          }
        } else {
          // User is logged in but no selected college
          // Check if they had one in localStorage before login
          const savedCollege = localStorage.getItem('selectedCollege');
          if (savedCollege) {
            try {
              const collegeData = JSON.parse(savedCollege);
              const college = colleges.find(c => c._id === collegeData.id);
              if (college) {
                // Auto-save the localStorage college to user profile
                await changeCollege(collegeData.id);
                // Remove from localStorage since it's now saved to user profile
                localStorage.removeItem('selectedCollege');
                setShowPopup(false);
              } else {
                setShowPopup(true);
              }
            } catch (error) {
              console.error('Error parsing saved college:', error);
              localStorage.removeItem('selectedCollege');
              setShowPopup(true);
            }
          } else {
            // No saved college, show popup
            setShowPopup(true);
          }
        }
      } else {
        // User not logged in - check localStorage
        const savedCollege = localStorage.getItem('selectedCollege');
        if (savedCollege) {
          try {
            const collegeData = JSON.parse(savedCollege);
            const college = colleges.find(c => c._id === collegeData.id);
            if (college) {
              setSelectedCollege(college);
              setIsCollegeSelected(true);
              setShowPopup(false);
            } else {
              // Invalid saved college, show popup
              localStorage.removeItem('selectedCollege');
              setShowPopup(true);
            }
          } catch (error) {
            console.error('Error parsing saved college:', error);
            localStorage.removeItem('selectedCollege');
            setShowPopup(true);
          }
        } else {
          // No saved college, show popup
          setShowPopup(true);
        }
      }
      setLoading(false);
    };

    handleCollegeSelection();
  }, [user, colleges]);

  const loadColleges = async () => {
    try {
      const response = await collegeAPI.getColleges();
      setColleges(response.data.colleges);
    } catch (error) {
      console.error('Error loading colleges:', error);
      setColleges([]);
    }
  };

  const changeCollege = async (collegeId) => {
    try {
      const college = colleges.find(c => c._id === collegeId);
      if (!college) return;

      setSelectedCollege(college);
      setIsCollegeSelected(true);
      setShowPopup(false);

      if (user) {
        // Update user's selected college in backend
        await collegeAPI.updateUserCollege(collegeId);
        localStorage.setItem('selectedCollege', JSON.stringify({
          id: college._id,
          name: college.name
        }));
      } else {
        // Save to localStorage for non-logged users
        localStorage.setItem('selectedCollege', JSON.stringify({
          id: college._id,
          name: college.name
        }));
      }
    } catch (error) {
      console.error('Error changing college:', error);
    }
  };

  const value = {
    colleges,
    selectedCollege,
    isCollegeSelected,
    loading,
    showPopup,
    changeCollege,
    loadColleges,
    setShowPopup
  };

  return (
    <CollegeContext.Provider value={value}>
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
};