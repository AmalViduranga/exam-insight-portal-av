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
  loading: boolean;
  checkAuth: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      // 1. If Supabase is active, check Supabase session first
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          localStorage.setItem('excel_platform_token', session.access_token);
          // Fetch or map profile
          const meta = session.user.user_metadata || {};
          setUser({
            id: session.user.id,
            email: session.user.email,
            username: session.user.email?.split('@')[0],
            fullName: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
            role: meta.role === 'ADMIN' ? 'ADMIN' : 'USER',
            avatarUrl: meta.avatar_url,
          });
          setLoading(false);
          return;
        }
      }

      // 2. Otherwise query backend /auth/me
      const res = await api.get('/auth/me');
      if (res.data) {
        setUser(res.data);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      // If Supabase is active and identifier is an email, try Supabase auth
      if (isSupabaseConfigured && supabase && identifier.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });

        if (error) {
          return { success: false, message: error.message };
        }

        if (data.session) {
          localStorage.setItem('excel_platform_token', data.session.access_token);
          const meta = data.user.user_metadata || {};
          setUser({
            id: data.user.id,
            email: data.user.email,
            username: data.user.email?.split('@')[0],
            fullName: meta.full_name || data.user.email?.split('@')[0] || 'User',
            role: meta.role === 'ADMIN' ? 'ADMIN' : 'USER',
          });
          return { success: true };
        }
      }

      // Fallback or username login via Express API
      const res = await api.post('/auth/login', { username: identifier, password });
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
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'USER',
            },
          },
        });

        if (error) {
          return { success: false, message: error.message };
        }

        if (data.session) {
          localStorage.setItem('excel_platform_token', data.session.access_token);
          setUser({
            id: data.user!.id,
            email: data.user!.email,
            username: email.split('@')[0],
            fullName,
            role: 'USER',
          });
          return { success: true, message: 'Account created and signed in!' };
        }

        return {
          success: true,
          message: 'Sign up successful! Please check your email inbox to verify your account.',
        };
      }

      // Express API signup
      const res = await api.post('/auth/signup', { email, password, fullName });
      if (res.data.token) {
        localStorage.setItem('excel_platform_token', res.data.token);
      }
      setUser(res.data.user);
      return { success: true, message: 'Account created successfully!' };
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
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('excel_platform_token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      } else {
        await api.post('/auth/forgot-password', { email });
      }
      return { success: true, message: 'Password reset instructions have been dispatched to your email.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send reset email.' };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      } else {
        await api.post('/auth/reset-password', { token, newPassword });
      }
      return { success: true, message: 'Password updated successfully! You can now log in.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update password.' };
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for Supabase auth state change if configured
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          localStorage.setItem('excel_platform_token', session.access_token);
          const meta = session.user.user_metadata || {};
          setUser({
            id: session.user.id,
            email: session.user.email,
            username: session.user.email?.split('@')[0],
            fullName: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
            role: meta.role === 'ADMIN' ? 'ADMIN' : 'USER',
            avatarUrl: meta.avatar_url,
          });
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
