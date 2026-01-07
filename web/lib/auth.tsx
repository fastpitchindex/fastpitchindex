"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isPro: boolean;
  isProLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isProLoading, setIsProLoading] = useState(true);
  const router = useRouter();
  
  // Track if we've explicitly signed out (to prevent accidental clears)
  const explicitSignOutRef = useRef(false);
  // Track last known valid session to restore if Supabase clears it
  const lastKnownValidSessionRef = useRef<Session | null>(null);

  // Check subscription status
  const checkProStatus = async (userId: string, sessionToken?: string) => {
    try {
      // Use provided session token or fall back to state session
      const token = sessionToken || session?.access_token;
      if (!token) {
        setIsPro(false);
        setIsProLoading(false);
        return;
      }

      const supabaseUrl = typeof window !== 'undefined' 
        ? (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
            ? `http://${window.location.hostname}:54321`
            : 'http://127.0.0.1:54321')
        : 'http://127.0.0.1:54321';
      
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&select=status,current_period_end&limit=1`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const hasActiveSubscription = Array.isArray(data) && data.length > 0 && 
          (data[0].status === 'active' || data[0].status === 'trialing') &&
          (!data[0].current_period_end || new Date(data[0].current_period_end) > new Date());
        setIsPro(hasActiveSubscription);
        console.log('Pro status checked:', hasActiveSubscription, data);
      } else {
        console.error('Failed to check pro status:', response.status, await response.text());
        setIsPro(false);
      }
    } catch (error) {
      console.error('Error checking pro status:', error);
      setIsPro(false);
    } finally {
      setIsProLoading(false);
    }
  };

  useEffect(() => {
    // On mount, try to restore session immediately if it exists in storage
    // This helps when the page reloads and Supabase hasn't restored the session yet
    const restoreSessionOnMount = async () => {
      if (explicitSignOutRef.current) return; // Don't restore if we explicitly signed out
      
      // First, check localStorage directly to see if session exists
      let sessionInStorage = false;
      try {
        if (typeof window !== 'undefined') {
          // Check all localStorage keys for Supabase session
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('supabase.auth') || key.includes('auth-token'))) {
              const value = localStorage.getItem(key);
              if (value) {
                try {
                  const parsed = JSON.parse(value);
                  if (parsed?.currentSession || parsed?.session || parsed?.access_token) {
                    sessionInStorage = true;
                    console.log('Found session in localStorage on mount:', key);
                    break;
                  }
                } catch {
                  // Not JSON, continue
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error checking localStorage on mount:', err);
      }
      
      // If we found a session in storage, try to get it from Supabase
      // Wait a bit for Supabase to restore it, then try getSession
      if (sessionInStorage) {
        // Wait a moment for Supabase to restore from storage
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (!sessionError && sessionData?.session) {
          console.log('Restored session on mount from Supabase');
          lastKnownValidSessionRef.current = sessionData.session;
          setSession(sessionData.session);
          setUser(sessionData.session.user ?? null);
          if (sessionData.session.user) {
            checkProStatus(sessionData.session.user.id, sessionData.session.access_token);
          }
          if (loading) {
            setLoading(false);
          }
        } else {
          // No session found on mount - user is not logged in
          setIsPro(false);
          setIsProLoading(false);
          if (loading) {
            setLoading(false);
          }
        }
      } catch (err) {
        console.warn('Failed to restore session on mount:', err);
        // On error, assume no session
        setIsPro(false);
        setIsProLoading(false);
        if (loading) {
          setLoading(false);
        }
      }
    };
    
    // Try to restore immediately
    restoreSessionOnMount();
    
    // Listen for auth changes - this will fire immediately if there's an existing session
    // We avoid getSession() to prevent CORS issues on mobile, except for INITIAL_SESSION recovery
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      const currentSession = session; // Capture current session before any updates
      console.log('Auth state change:', event, newSession ? 'has session' : 'no session', 'explicitSignOut:', explicitSignOutRef.current, 'currentSession:', currentSession ? 'exists' : 'null');
      
      // Handle INITIAL_SESSION specially - if no session, try to get it from Supabase
      // This can happen on page reload when Supabase hasn't restored the session yet
      if (event === 'INITIAL_SESSION' && !newSession && !currentSession && !explicitSignOutRef.current) {
        console.log('INITIAL_SESSION with no session - attempting to restore from Supabase');
        
        // Check if there's a session in localStorage first
        let hasStoredSession = false;
        try {
          if (typeof window !== 'undefined') {
            // Check all localStorage keys for Supabase session
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.includes('supabase.auth') || key.includes('auth-token'))) {
                const value = localStorage.getItem(key);
                if (value) {
                  try {
                    const parsed = JSON.parse(value);
                    if (parsed?.currentSession || parsed?.session) {
                      hasStoredSession = true;
                      console.log('Found session in localStorage:', key);
                      break;
                    }
                  } catch {
                    // Not JSON, continue
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn('Error checking localStorage:', err);
        }
        
        // If we found a session in storage, wait a bit and retry getSession
        // Sometimes Supabase needs a moment to restore the session
        if (hasStoredSession) {
          console.log('Session found in localStorage, waiting for Supabase to restore...');
          // Wait a bit and retry
          setTimeout(async () => {
            try {
              const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
              if (!sessionError && sessionData?.session) {
                console.log('Restored session from Supabase storage after retry');
                lastKnownValidSessionRef.current = sessionData.session;
                setSession(sessionData.session);
                setUser(sessionData.session.user ?? null);
                if (sessionData.session.user) {
                  checkProStatus(sessionData.session.user.id, sessionData.session.access_token);
                }
              } else {
                console.warn('Session in localStorage but getSession() returned no session');
              }
            } catch (err) {
              console.warn('Failed to restore session on retry:', err);
            }
          }, 100);
        }
        
        try {
          // Try to get the session immediately
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (!sessionError && sessionData?.session) {
            console.log('Restored session from Supabase storage');
            lastKnownValidSessionRef.current = sessionData.session;
            setSession(sessionData.session);
            setUser(sessionData.session.user ?? null);
            if (sessionData.session.user) {
              checkProStatus(sessionData.session.user.id, sessionData.session.access_token);
            }
            if (loading) {
              setLoading(false);
            }
            return;
          } else {
            // No session found immediately
            if (hasStoredSession) {
              // We found it in localStorage, so wait for the retry above
              console.log('Session in localStorage but not yet restored by Supabase - will retry');
              if (loading) {
                setLoading(false);
              }
              return; // Don't continue to other handlers, wait for retry
            } else {
              // No session found - this is fine, user is not logged in
              console.log('No session found on INITIAL_SESSION - user is not logged in');
              setIsPro(false);
              setIsProLoading(false);
              if (loading) {
                setLoading(false);
              }
              return; // Don't continue to other handlers
            }
          }
        } catch (err) {
          console.warn('Failed to restore session on INITIAL_SESSION:', err);
          // If we can't restore, just set loading to false and preserve any existing state
          setIsPro(false);
          setIsProLoading(false);
          if (loading) {
            setLoading(false);
          }
          return; // Don't continue to other handlers
        }
      }
      
      // CRITICAL: Only clear user/session on explicit SIGNED_OUT event when we've explicitly signed out
      // This prevents accidental logouts from API errors or network issues
      if (event === 'SIGNED_OUT') {
        // Only actually sign out if we explicitly requested it
        if (explicitSignOutRef.current) {
          explicitSignOutRef.current = false; // Reset flag after handling
          setSession(null);
          setUser(null);
          setIsPro(false);
          setIsProLoading(false);
          setLoading(false);
          return;
        } else {
          // SIGNED_OUT event but we didn't explicitly sign out - IGNORE IT COMPLETELY
          // This prevents accidental logouts from errors
          console.warn('SIGNED_OUT event received but not explicitly signed out - IGNORING and preserving session');
          // Don't update any state - preserve existing session
          return;
        }
      }
      
      // Reset the explicit sign out flag on sign in
      if (event === 'SIGNED_IN') {
        explicitSignOutRef.current = false;
      }
      
      // For all other events, preserve existing session if new session is null
      // This prevents clearing session on token refresh failures or API errors
      if (newSession) {
        // We have a valid session, update it and store it
        lastKnownValidSessionRef.current = newSession;
        setSession(newSession);
        setUser(newSession.user ?? null);
      } else {
        // Session is null in the event
        // NEVER clear session unless we explicitly signed out
        // Preserve existing session by restoring from last known valid session or current state
        if (!explicitSignOutRef.current) {
          // We didn't explicitly sign out - preserve existing session
          const sessionToPreserve = currentSession || lastKnownValidSessionRef.current;
          if (sessionToPreserve) {
            console.log('Preserving existing session despite null session in event:', event);
            // Restore the session
            setSession(sessionToPreserve);
            setUser(sessionToPreserve.user ?? null);
            lastKnownValidSessionRef.current = sessionToPreserve; // Update stored session
          }
          // Still update loading state if needed
          if (loading) {
            setLoading(false);
          }
          return;
        }
        // Only clear if we explicitly signed out (handled above in SIGNED_OUT case)
      }
      
      // Set loading to false once we get the first auth state change
      if (loading) {
        setLoading(false);
      }
      
      // Create profile after email confirmation
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if profile exists, if not create it
        const userMetadata = session.user.user_metadata;
        if (userMetadata?.display_name || userMetadata?.username) {
          try {
            const supabaseUrl = typeof window !== 'undefined' 
              ? (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
                  ? `http://${window.location.hostname}:54321`
                  : 'http://127.0.0.1:54321')
              : 'http://127.0.0.1:54321';
            
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
            
            // Check if profile exists
            const checkResponse = await fetch(
              `${supabaseUrl}/rest/v1/profiles?id=eq.${session.user.id}&select=id&limit=1`,
              {
                headers: {
                  'apikey': supabaseAnonKey,
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (checkResponse.ok) {
              const profileData = await checkResponse.json();
              if (!Array.isArray(profileData) || profileData.length === 0) {
                // Profile doesn't exist, create it
                // Sanitize display name from metadata
                const rawDisplayName = userMetadata.display_name || session.user.email?.split('@')[0] || '';
                const sanitizedDisplayName = rawDisplayName
                  .trim()
                  .replace(/[<>]/g, '') // Remove HTML tags
                  .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '') // Remove control characters
                  .substring(0, 100); // Limit to 100 characters
                
                await fetch(`${supabaseUrl}/rest/v1/profiles`, {
                  method: 'POST',
                  headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                  },
                  body: JSON.stringify({
                    id: session.user.id,
                    username: userMetadata.username || session.user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'user',
                    display_name: sanitizedDisplayName || null,
                  }),
                });
              }
            }
          } catch (profileError) {
            console.error('Error creating profile after confirmation:', profileError);
          }
        }
      }
      
      if (session?.user) {
        // Pass the session token directly to avoid timing issues with state updates
        checkProStatus(session.user.id, session.access_token);
      } else {
        setIsPro(false);
        setIsProLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Use direct fetch to Supabase Auth API to avoid CORS issues on mobile
      // Similar to how we fixed the database reads
      const supabaseUrl = typeof window !== 'undefined' 
        ? (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
            ? `http://${window.location.hostname}:54321`
            : 'http://127.0.0.1:54321')
        : 'http://127.0.0.1:54321';
      
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
      
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Authentication failed' }));
        console.error('Sign in error:', errorData);
        return { error: { message: errorData.message || errorData.error_description || 'Failed to log in' } };
      }
      
      const data = await response.json();
      
      if (!data.access_token || !data.user) {
        console.error('Sign in succeeded but no token/user returned');
        return { error: { message: 'Failed to create session' } };
      }
      
      // Create session object from the response
      const session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: data.expires_at,
        token_type: data.token_type,
        user: data.user,
      };
      
      setSession(session as any);
      setUser(data.user);
      if (data.user && session.access_token) {
        await checkProStatus(data.user.id, session.access_token);
      }
      router.push("/tournaments");
      router.refresh();
      
      return { error: null };
    } catch (err) {
      console.error('Sign in exception:', err);
      return { error: { message: err instanceof Error ? err.message : 'Network error. Please check your connection.' } };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5175';
    
    // Generate username from email
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Sanitize display name to prevent malicious input
    const sanitizedDisplayName = displayName
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '') // Remove control characters
      .substring(0, 100); // Limit to 100 characters
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/login`,
        data: {
          display_name: sanitizedDisplayName,
          username: username,
        },
      },
    });
    
    if (!error && data.user) {
      // Store display name in user metadata for profile creation after confirmation
      // The profile will be created via database trigger or on first login after confirmation
    }
    
    return { error };
  };

  const signOut = async () => {
    explicitSignOutRef.current = true;
    const { error } = await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsPro(false);
    setIsProLoading(true);
    router.push("/");
    router.refresh();
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        isPro,
        isProLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
