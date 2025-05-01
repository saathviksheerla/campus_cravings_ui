// src/components/PhoneVerification.jsx
import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../firebase/config';
import { updatePhone, verifyPhone, checkPhoneStatus } from '../services/api';
import toast from 'react-hot-toast';

const PhoneVerification = ({ onComplete, canSkip = true }) => {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('input'); // 'input', 'verify', 'success'
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Check if user already has a phone number
    const checkPhone = async () => {
      try {
        const response = await checkPhoneStatus();
        if (response.data.phone) {
          setPhone(response.data.phone);
        }
      } catch (error) {
        console.error('Error checking phone:', error);
      }
    };
    
    checkPhone();
    
    // Setup recaptcha when component mounts
    if (typeof window !== 'undefined') {
      setupRecaptcha();
    }
    
    // Cleanup recaptcha when component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);
  
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          toast.error('reCAPTCHA expired. Please try again.');
        }
      });
    }
  };
  
  const handleSendCode = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update phone in database first
      await updatePhone({ phone });
      
      // Format phone number for Firebase (add country code if needed)
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`; // Assuming India (+91)
      
      // Send verification code
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('verify');
      toast.success('Verification code sent!');
    } catch (error) {
      console.error('Error sending code:', error);
      toast.error(error.message || 'Failed to send verification code');
      
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      setupRecaptcha();
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }
    
    try {
      setLoading(true);
      
      // Confirm the code with Firebase
      await confirmationResult.confirm(verificationCode);
      
      // Update verification status in our database
      await verifyPhone({
        phone,
        verified: true
      });
      
      setStep('success');
      toast.success('Phone verified successfully!');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    }
  };
  
  if (step === 'success') {
    return (
      <div className="bg-green-50 p-4 rounded-md">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Phone number verified successfully!
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      {step === 'input' && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                type="tel"
                id="phone"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={loading}
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              We'll send a verification code to this number
            </p>
          </div>
          
          <div id="recaptcha-container" className="mt-2"></div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : 'Send Verification Code'}
            </button>
            
            {canSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Skip for Now
              </button>
            )}
          </div>
        </form>
      )}
      
      {step === 'verify' && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                maxLength={6}
                disabled={loading}
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Enter the verification code sent to your phone
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify Code'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('input')}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            
            {canSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Skip for Now
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default PhoneVerification;