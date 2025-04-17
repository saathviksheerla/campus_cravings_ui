// src/components/NotificationService.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthenticationContext';
import { requestNotificationPermission, onMessageListener } from '../firebase/config';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationService = () => {
  const baseUrl = process.env.REACT_APP_API_URL;
  const { user } = useAuth();
  const [isTokenSaved, setIsTokenSaved] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (user && !isTokenSaved) {
        const token = await requestNotificationPermission();
        if (token) {
          try {
            await api.post(`${baseUrl}/user/fcm-token`, { token });
            setIsTokenSaved(true);
            console.log('FCM token saved to server');
          } catch (error) {
            console.error('Failed to save token to server:', error);
          }
        }
      }
    };

    initializeNotifications();
  }, [user, isTokenSaved]);

  // Listen for messages when app is in foreground
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onMessageListener().then((payload) => {
      const { notification } = payload;
      
      if (notification) {
        // Show toast notification
        toast(
          <div>
            <h4 className="font-bold">{notification.title}</h4>
            <p>{notification.body}</p>
          </div>,
          {
            duration: 6000,
            position: 'top-right'
          }
        );
        
        // Play sound
        const audio = new Audio('/sizzle.mp3'); // Add a sound file to your public folder
        audio.play().catch(e => console.log('Error playing sound:', e));
      }
    });

    return () => {
      unsubscribe.catch(e => console.log('Error unsubscribing:', e));
    };
  }, [user]);

  // This component doesn't render anything
  return null;
};

export default NotificationService;