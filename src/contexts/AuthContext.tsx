'use client';

import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile } from '@/types/profile';
import { getProfile } from '@/lib/profile';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch the user's profile data
  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    const userProfile = await getProfile(userId);
    setProfile(userProfile);
    setProfileLoading(false);
  };

  // Function to manually refresh the profile data
  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting initial session:", error.message);
      }
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Fetch profile if we have a user
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`Auth event: ${event}`);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Handle profile data on auth changes
        if (currentSession?.user) {
          if (event === 'SIGNED_IN') {
            await fetchProfile(currentSession.user.id);
          } else if (event === 'USER_UPDATED') {
            await refreshProfile();
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
    // User, session, and profile will be set to null by onAuthStateChange listener
    setLoading(false);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 