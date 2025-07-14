// src/pages/PhoneVerificationPage.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';
import PhoneVerification from '../components/PhoneVerification';

export default function PhoneVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get the return URL from location state or default to cart
  const returnTo = location.state?.returnTo || '/cart';

  // If user is already verified, redirect to the return URL
  useEffect(() => {
    if (user?.isPhoneVerified) {
      navigate(returnTo);
    }
  }, [user, navigate, returnTo]);

  const handleVerificationComplete = () => {
    // After successful verification, redirect back to where they came from
    navigate(returnTo);
  };

  return (
    <div className="bg-primary min-h-screen">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-primary-light shadow-luxury rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-secondary/10">
            <h1 className="font-display text-2xl font-bold text-accent text-center">
              Phone Verification Required
            </h1>
            <p className="mt-2 font-body text-secondary/70 text-center">
              Please verify your phone number to complete your order
            </p>
          </div>
          
          <div className="px-6 py-8">
            <PhoneVerification 
              onComplete={handleVerificationComplete} 
              canSkip={false} 
            />
          </div>
          
          <div className="px-6 py-4 bg-primary-dark border-t border-secondary/10">
            <button
              onClick={() => navigate(returnTo)}
              className="w-full py-2 text-secondary/70 hover:text-secondary font-body text-sm transition-colors"
            >
              ← Back to {returnTo === '/cart' ? 'Cart' : 'Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}