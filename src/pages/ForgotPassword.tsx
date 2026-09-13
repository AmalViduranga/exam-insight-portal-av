import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FileSpreadsheet, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return addToast('Please enter your email', 'error');

    try {
      setLoading(true);
      const res = await forgotPassword(email);
      setSubmitted(true);
      addToast(res.message, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to submit reset request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">Excel Insight</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Reset your password
        </h2>
        <p className="text-xs text-slate-500">
          Enter your registered email address and we'll dispatch password recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="rounded-3xl border-slate-200/80 shadow-xl bg-white p-2">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Check your inbox</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If an account exists for <strong>{email}</strong>, a password reset link has been sent. Follow the link in that email to choose a new password.
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="outline" className="w-full rounded-xl">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="analyst@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all"
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </Button>

                <div className="text-center pt-2">
                  <Link to="/login" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-indigo-600">
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
