import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface User {
  id: string;
  username?: string;
  email?: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; session?: any; message?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (newPassword: string, token?: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapSupabaseUser(sbUser: any): User {
  const meta = sbUser.user_metadata || {};
  const email = sbUser.email || '';
  const emailPrefix = email.split('@')[0];
  return {
    id: sbUser.id,
    email,
    username: meta.username || emailPrefix || 'user',
    fullName: meta.full_name || meta.name || emailPrefix || 'User',
    role: meta.role === 'ADMIN' ? 'ADMIN' : 'USER',
    avatarUrl: meta.avatar_url,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);

      // 1. If Supabase is configured, check Supabase session first
      if (isSupabaseConfigured && supabase) {
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (sbSession && sbSession.user) {
          localStorage.setItem('excel_platform_token', sbSession.access_token);
          setSession(sbSession);
          setUser(mapSupabaseUser(sbSession.user));
          setLoading(false);
          return;
        }
      }

      // 2. Otherwise check stored token against Express /auth/me
      const storedToken = localStorage.getItem('excel_platform_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            setLoading(false);
            return;
          }
        } catch {
          // Stored token is invalid or expired
          localStorage.removeItem('excel_platform_token');
        }
      }

      setUser(null);
      setSession(null);
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const cleanIdentifier = identifier.trim();

      // 1. If Supabase is active and identifier looks like an email, try Supabase auth
      if (isSupabaseConfigured && supabase && cleanIdentifier.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanIdentifier,
          password,
        });

        if (!error && data.session && data.user) {
          localStorage.setItem('excel_platform_token', data.session.access_token);
          setSession(data.session);
          setUser(mapSupabaseUser(data.user));
          return { success: true };
        }

        // Catch specific email verification pending error
        if (error && error.message.toLowerCase().includes('confirm')) {
          return {
            success: false,
            message: 'Please verify your email address before logging in.',
          };
        }

        // If error is anything other than invalid credentials, surface message
        if (error && !error.message.toLowerCase().includes('invalid login credentials')) {
          return { success: false, message: error.message };
        }
      }

      // 2. Fallback or username login via Express API
      const res = await api.post('/auth/login', { username: cleanIdentifier, password });
      if (res.data.token) {
        localStorage.setItem('excel_platform_token', res.data.token);
      }
      setUser(res.data.user || res.data);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Supabase Signup
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: 'USER',
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          return { success: false, message: error.message };
        }

        // If email confirmation is disabled or immediate session created
        if (data.session && data.user) {
          localStorage.setItem('excel_platform_token', data.session.access_token);
          setSession(data.session);
          setUser(mapSupabaseUser(data.user));
          return {
            success: true,
            session: data.session,
            message: 'Account created and signed in successfully!',
          };
        }

        // If email verification is required (session is null)
        return {
          success: true,
          session: null,
          message: 'Account created! Please check your email inbox to verify your account.',
        };
      }

      // 2. Express API signup fallback
      const res = await api.post('/auth/signup', {
        email: cleanEmail,
        password,
        fullName: fullName.trim(),
      });

      if (res.data.token) {
        localStorage.setItem('excel_platform_token', res.data.token);
      }
      setUser(res.data.user);
      return {
        success: true,
        session: res.data.token ? { access_token: res.data.token } : null,
        message: 'Account created successfully!',
      };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } else {
      alert('Google OAuth requires Supabase configuration in environment variables.');
    }
  };

  const logout = async () => {
    try {
      // Step 1: Call backend logout first to clear server session & cookies
      try {
        await api.post('/auth/logout');
      } catch (err) {
        console.warn('[Logout]: Backend logout call error (proceeding to clear local state):', err);
      }

      // Step 2: Sign out from Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.warn('[Logout]: Supabase signOut error:', err);
        }
      }
    } finally {
      // Step 3: Clear all client-side state and tokens
      localStorage.removeItem('excel_platform_token');
      setUser(null);
      setSession(null);
      window.location.href = '/login';
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const cleanEmail = email.trim();
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        return {
          success: true,
          message: 'Password reset instructions have been dispatched to your email.',
        };
      }

      // Fallback: Express API
      const res = await api.post('/auth/forgot-password', { email: cleanEmail });
      return {
        success: true,
        message: res.data?.message || 'Password reset instructions have been dispatched to your email.',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send reset email.' };
    }
  };

  const resetPassword = async (newPassword: string, token?: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;

        // Invalidate recovery session after successful password reset
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore
        }

        return { success: true, message: 'Password updated successfully! You can now log in.' };
      }

      // Fallback: Express API
      if (token) {
        const res = await api.post('/auth/reset-password', { token, newPassword });
        return { success: true, message: res.data?.message || 'Password updated successfully!' };
      }

      return { success: false, message: 'Missing password reset token or recovery session.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update password.' };
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for Supabase auth state change if configured
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
          if (newSession?.user) {
            localStorage.setItem('excel_platform_token', newSession.access_token);
            setSession(newSession);
            setUser(mapSupabaseUser(newSession.user));
          }
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          if (newSession?.access_token) {
            localStorage.setItem('excel_platform_token', newSession.access_token);
            setSession(newSession);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          localStorage.removeItem('excel_platform_token');
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        checkAuth,
        login,
        signUp,
        loginWithGoogle,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
