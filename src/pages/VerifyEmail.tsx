import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { MailCheck, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';

export function VerifyEmail() {
  const location = useLocation();
  const { addToast } = useToast();

  const [email, setEmail] = useState<string>(location.state?.email || '');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) {
      return addToast('Please enter your email address to resend verification.', 'error');
    }

    try {
      setResending(true);
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim().toLowerCase(),
        });
        if (error) throw error;
      }
      setResent(true);
      addToast('Verification email resent successfully! Check your inbox.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to resend verification email.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs border border-indigo-100">
          <MailCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Verify your email address
        </h1>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          We have dispatched an activation link to{' '}
          {email ? (
            <strong className="text-slate-900 font-semibold">{email}</strong>
          ) : (
            'your registered email'
          )}
          . Please click the link in the message to activate your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="rounded-3xl border-slate-200/80 shadow-xl bg-white">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                Next Steps
              </div>
              <ul className="list-disc pl-4 space-y-1 text-amber-800">
                <li>Check your inbox and click the verification button.</li>
                <li>If not found in a minute, check your Spam or Junk folder.</li>
                <li>Once verified, return here to log in to your workspace.</li>
              </ul>
            </div>

            {resent && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                A new verification email has been dispatched.
              </div>
            )}

            {!location.state?.email && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            )}

            <div className="space-y-3 pt-1">
              <Button
                type="button"
                onClick={handleResend}
                disabled={resending}
                variant="outline"
                className="w-full h-11 rounded-xl font-bold border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Resending...' : 'Resend Verification Email'}
              </Button>

              <Link to="/login" className="block">
                <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-100">
                  Proceed to Sign In
                </Button>
              </Link>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
