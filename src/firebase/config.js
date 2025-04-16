// src/firebase/config.js - modified version
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB1eenTFDJNcDVFg5QiJxKrzTClg6UrrsI",
  authDomain: "campus-cravings-dd75f.firebaseapp.com",
  projectId: "campus-cravings-dd75f",
  storageBucket: "campus-cravings-dd75f.firebasestorage.app",
  messagingSenderId: "231130845805",
  appId: "1:231130845805:web:e1c511436dcb84a5d2a564"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const messaging = getMessaging(app);

// Function to request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    
    console.log('Notification permission granted');
    
    // Get FCM token
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY // You need to add this to your .env file
    });
    
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Function to handle foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

export { auth, messaging };
export default app;