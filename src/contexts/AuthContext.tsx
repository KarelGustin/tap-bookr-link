import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔧 Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up real-time database updates for profile changes
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔧 Setting up real-time profile updates for user:', user.id);

    // Subscribe to profile changes
    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔧 Profile updated in real-time:', payload);
          // This will trigger a re-render and the ProtectedRoute will check the new status
        }
      )
      .subscribe();

    return () => {
      console.log('🔧 Cleaning up profile subscription');
      profileSubscription.unsubscribe();
    };
  }, [user?.id]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (data.user && !error) {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .single();
      
      if (!existingProfile) {
        // Only create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            handle: '',
            status: 'draft'
          });
        
        if (profileError) {
          console.error('Failed to create profile:', profileError);
        }
      } else {
        console.log('Profile already exists for user:', data.user.id);
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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