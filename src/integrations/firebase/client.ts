import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate required configuration - but don't crash in development
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!isConfigured) {
  console.warn('⚠️ Firebase configuration missing. Please set environment variables:');
  console.warn('  - VITE_FIREBASE_API_KEY');
  console.warn('  - VITE_FIREBASE_PROJECT_ID');
  console.warn('  - VITE_FIREBASE_AUTH_DOMAIN');
  console.warn('  - VITE_FIREBASE_STORAGE_BUCKET');
  console.warn('  - VITE_FIREBASE_MESSAGING_SENDER_ID');
  console.warn('  - VITE_FIREBASE_APP_ID');
  console.warn('See FIREBASE_MIGRATION.md for setup instructions.');
  
  // Use placeholder config to prevent crashes in development
  // In production, we'll still try to initialize but with warnings
  if (import.meta.env.DEV) {
    firebaseConfig.apiKey = firebaseConfig.apiKey || 'dev-placeholder';
    firebaseConfig.projectId = firebaseConfig.projectId || 'dev-placeholder';
    firebaseConfig.authDomain = firebaseConfig.authDomain || 'dev-placeholder.firebaseapp.com';
    firebaseConfig.storageBucket = firebaseConfig.storageBucket || 'dev-placeholder.appspot.com';
    firebaseConfig.messagingSenderId = firebaseConfig.messagingSenderId || '123456789';
    firebaseConfig.appId = firebaseConfig.appId || '1:123456789:web:abc123';
  }
  // In production, we'll still initialize but Firebase operations will fail gracefully
}

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  if (import.meta.env.DEV) {
    console.log('✅ Firebase initialized:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket,
    });
  }
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  // Initialize analytics asynchronously to prevent blocking
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
        if (import.meta.env.DEV) {
          console.log('✅ Firebase Analytics initialized');
        }
      } catch (error) {
        console.warn('⚠️ Analytics initialization error:', error);
      }
    }
  }).catch((error) => {
    console.warn('⚠️ Analytics not supported:', error);
  });
}

export { analytics };

export default app;
