import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  AuthError
} from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';

// Create Supabase-compatible User type
interface User {
  id: string;
  email: string | null;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Firebase user to Supabase-compatible format
  const convertUser = (firebaseUser: FirebaseUser | null): User | null => {
    if (!firebaseUser) return null;
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      ...firebaseUser
    };
  };

  useEffect(() => {
    let mounted = true;

    // Only set up auth listener if Firebase is configured
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID === 'dev-placeholder') {
      // Firebase not configured - set loading to false immediately
      if (mounted) {
        setLoading(false);
      }
      return;
    }

    // Set up auth state listener
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('🔧 Auth state change:', firebaseUser?.email, firebaseUser?.uid);
        
        if (mounted) {
          const convertedUser = convertUser(firebaseUser);
          setUser(convertedUser);
          setSession(convertedUser ? { user: convertedUser } : null);
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      if (mounted) {
        setLoading(false);
      }
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('🔧 Starting signup process for:', email);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        console.log('🔧 Signup successful, verification email sent');
      }
      
      return { error: null };
    } catch (error) {
      console.error('🔧 Signup error:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      console.error('🔧 Signin error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
