// src/components/GoogleAuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';
import PhoneVerification from './PhoneVerification';
import toast from 'react-hot-toast';

export default function GoogleAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [showVerification, setShowVerification] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [authProcessed, setAuthProcessed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const processAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        // Only process authentication once
        if (!authProcessed) {
          if (token) {
            await login(token);
            
            if (isMounted) {
              toast.success('Successfully logged in!');
              setShowVerification(true);
              setAuthProcessed(true); // Mark auth as processed
              setIsProcessing(false);
            }
          } else if (error) {
            if (isMounted) {
              toast.error(`Authentication failed: ${error}`);
              navigate('/login');
            }
          } else {
            if (isMounted) {
              toast.error('Authentication failed');
              navigate('/login');
            }
          }
        } else {
          if (isMounted) {
            setIsProcessing(false);
          }
        }
      } catch (err) {
        console.error('Auth processing error:', err);
        if (isMounted) {
          toast.error('Authentication error occurred');
          navigate('/login');
        }
      }
    };

    processAuth();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [location, login, navigate, authProcessed]);

  const handleVerificationComplete = () => {
    try {
    // Check if there's a return URL in the location state
    const returnTo = location.state?.returnTo || '/menu';
    window.location.href = returnTo;
  } catch (err) {
    console.error('Navigation error:', err);
    // Fallback if navigation fails
    window.location.href = '/menu';
  }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if(user?.isPhoneVerified){
    handleVerificationComplete();
    return null;
  }

  if (showVerification && user?.isPhoneVerified === false) {
    return (
      <div className="container mx-auto max-w-md mt-12">
        <h1 className="text-2xl font-bold mb-6 text-center">Verify Your Phone Number</h1>
        <p className="mb-6 text-gray-600 text-center">
          To order food, please verify your phone number. You can skip this step for now but you'll need to verify before placing orders.
        </p>
        <PhoneVerification onComplete={handleVerificationComplete} canSkip={false} />
      </div>
    );
  }

  return null;
}