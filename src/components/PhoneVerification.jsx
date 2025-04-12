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
  const [useEmailVerification, setUseEmailVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  
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
    if (!useEmailVerification && typeof window !== 'undefined') {
      setupRecaptcha();
    }
    
    // Cleanup recaptcha when component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [useEmailVerification]);
  
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
    
    if (useEmailVerification) {
      // Handle email verification logic
      handleSendEmailCode();
      return;
    }
    
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
      console.log('Formatted Phone:', formattedPhone);
      
      // Send verification code
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('verify');
      toast.success('Verification code sent!');
    } catch (error) {
      console.error('Error sending code:', error);
      toast.error(error.message || 'Failed to send verification code');
      
      // Suggest email verification if billing error
      if (error.code === 'auth/billing-not-enabled') {
        toast.error('SMS verification unavailable. Try email verification instead.');
        setUseEmailVerification(true);
      }
      
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
  
  const handleSendEmailCode = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you'd call an API to send email with verification code
      // Here we'll simulate it with a mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, we'll just set a dummy code - in production, this would be generated server-side
      const dummyCode = '123456';
      console.log('Email verification code (for demo):', dummyCode);
      
      setStep('verify');
      toast.success('Verification code sent to your email!');
    } catch (error) {
      console.error('Error sending email code:', error);
      toast.error(error.message || 'Failed to send email verification code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (useEmailVerification) {
      // Handle email verification code logic
      handleVerifyEmailCode();
      return;
    }
    
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
  
  const handleVerifyEmailCode = async () => {
    if (!emailCode || emailCode.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }
    
    try {
      setLoading(true);
      
      // In production, you would verify this code with your backend
      // For demo purposes, we'll accept code 123456
      if (emailCode === '123456') {
        // Update verification status in our database
        await verifyPhone({
          phone: email, // Store email instead of phone
          verified: true
        });
        
        setStep('success');
        toast.success('Email verified successfully!');
        
        if (onComplete) {
          onComplete();
        }
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying email code:', error);
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
  
  const toggleVerificationMethod = () => {
    setUseEmailVerification(!useEmailVerification);
    setStep('input');
    setVerificationCode('');
    setEmailCode('');
  };
  
  if (step === 'success') {
    return (
      <div className="bg-green-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              {useEmailVerification ? 'Email' : 'Phone number'} verified successfully!
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {step === 'input' && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor={useEmailVerification ? "email" : "phone"} className="block text-sm font-medium text-primary">
              {useEmailVerification ? 'Email Address' : 'Phone Number'}
            </label>
            <div className="mt-1">
              {useEmailVerification ? (
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-primary/20 rounded-md shadow-sm focus:ring-accent focus:border-accent font-body"
                  disabled={loading}
                  required
                />
              ) : (
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full px-3 py-2 border border-primary/20 rounded-md shadow-sm focus:ring-accent focus:border-accent font-body"
                  disabled={loading}
                  required
                />
              )}
            </div>
            <p className="mt-1 text-sm text-primary/70">
              We'll send a verification code to this {useEmailVerification ? 'email' : 'number'}
            </p>
          </div>
          
          {!useEmailVerification && <div id="recaptcha-container"></div>}
          
          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-accent text-primary font-body font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
            
            <button
              type="button"
              onClick={toggleVerificationMethod}
              className="px-6 py-2 border border-primary/20 text-primary font-body font-medium rounded-md hover:bg-primary/5 transition-colors"
            >
              Use {useEmailVerification ? 'Phone' : 'Email'} Instead
            </button>
            
            {canSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-2 border border-primary/20 text-primary font-body font-medium rounded-md hover:bg-primary/5 transition-colors"
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
            <label htmlFor="code" className="block text-sm font-medium text-primary">
              Verification Code
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="code"
                placeholder="Enter 6-digit code"
                value={useEmailVerification ? emailCode : verificationCode}
                onChange={(e) => useEmailVerification 
                  ? setEmailCode(e.target.value)
                  : setVerificationCode(e.target.value)
                }
                className="block w-full px-3 py-2 border border-primary/20 rounded-md shadow-sm focus:ring-accent focus:border-accent font-body"
                maxLength={6}
                disabled={loading}
                required
              />
            </div>
            <p className="mt-1 text-sm text-primary/70">
              Enter the verification code sent to your {useEmailVerification ? 'email' : 'phone'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-accent text-primary font-body font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('input')}
              className="px-6 py-2 border border-primary/20 text-primary font-body font-medium rounded-md hover:bg-primary/5 transition-colors"
            >
              Back
            </button>
            
            {canSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-2 border border-primary/20 text-primary font-body font-medium rounded-md hover:bg-primary/5 transition-colors"
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