import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FileSpreadsheet, Lock, AlertTriangle, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const token = searchParams.get('token') || searchParams.get('code') || '';

  useEffect(() => {
    let isMounted = true;

    const verifyRecoveryState = async () => {
      if (isSupabaseConfigured && supabase) {
        // 1. Check existing session or URL hash / query code
        const { data: { session } } = await supabase.auth.getSession();
        const hasRecoveryHash =
          window.location.hash.includes('access_token') ||
          window.location.hash.includes('type=recovery');
        const hasQueryCode = searchParams.get('code') || searchParams.get('token');

        if (session || hasRecoveryHash || hasQueryCode) {
          if (isMounted) {
            setHasValidSession(true);
            setVerifyingSession(false);
          }
          return;
        }

        // 2. Listen for PASSWORD_RECOVERY event if Supabase processes hash asynchronously
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if ((event === 'PASSWORD_RECOVERY' || newSession) && isMounted) {
            setHasValidSession(true);
            setVerifyingSession(false);
          }
        });

        // 3. Timeout fallback
        const timeout = setTimeout(() => {
          if (isMounted) {
            setVerifyingSession(false);
          }
        }, 1200);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } else {
        // Standalone backend fallback with query token
        if (token) {
          setHasValidSession(true);
        }
        setVerifyingSession(false);
      }
    };

    verifyRecoveryState();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      return addToast('Password must be at least 6 characters.', 'error');
    }
    if (password !== confirmPassword) {
      return addToast('Passwords do not match.', 'error');
    }

    try {
      setLoading(true);
      const res = await resetPassword(password, token);
      if (res.success) {
        addToast(res.message, 'success');
        navigate('/login');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (verifyingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 font-medium">Verifying password recovery session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">Excel Insight</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create a new password
        </h1>
        <p className="text-xs text-slate-500">
          Enter your new strong password below to regain full account access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="rounded-3xl border-slate-200/80 shadow-xl bg-white p-2">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {!hasValidSession ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Invalid or Expired Link</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This password reset link is invalid or has expired. For security reasons, password recovery links are single-use and expire quickly.
                </p>
                <div className="pt-2 space-y-2">
                  <Link to="/forgot-password" className="block">
                    <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">
                      Request New Reset Link
                    </Button>
                  </Link>
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full h-11 rounded-xl font-semibold">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all mt-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving new password...</span>
                    </div>
                  ) : (
                    'Update Password'
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-indigo-600"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

