import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, Button } from '../components/ui';
import {
  Lock,
  User as UserIcon,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        navigate(redirectUrl);
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while logging in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full relative">
      <main className="flex-1 flex flex-col p-4 relative overflow-hidden items-center justify-center min-h-[calc(100vh-64px)]">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply" />
        </div>

        <div className="w-full max-w-5xl flex flex-col relative z-10">
          <div className="mb-6 self-start md:hidden">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center w-full">
            {/* Left Intro / Features */}
            <div className="hidden md:flex flex-col space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-indigo-600 text-xs font-bold border border-indigo-100 shadow-xs self-start">
                <ShieldCheck className="w-4 h-4" /> Excel Insight Platform
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Universal Spreadsheet{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                  Intelligence
                </span>
              </h1>
              <p className="text-base text-slate-600 leading-relaxed">
                Log in to access your saved cloud datasets, manage custom dynamic filter presets, and explore the Ministry of Education exam analysis suite.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  'Permanent cloud dataset persistence',
                  'Dynamic filter presets and saved reports',
                  'Ministry Exam school and subject rankings',
                  'Fast exports in Excel (.xlsx) and CSV',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Login Card */}
            <div className="flex justify-center w-full">
              <Card className="w-full max-w-md shadow-2xl border-slate-200/60 bg-white/95 backdrop-blur-xs rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500" />
                <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center space-y-5">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
                    <p className="text-slate-500 text-xs mt-1">
                      Enter your email or username to access your workspace
                    </p>
                  </div>

                  {/* Google OAuth */}
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="relative flex items-center justify-center w-full">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-xs text-slate-400 font-medium shrink-0">
                      Or credentials
                    </span>
                  </div>

                  {error && (
                    <div className="w-full bg-rose-50 text-rose-800 px-4 py-3 rounded-xl text-xs font-medium border border-rose-200 flex items-start gap-2">
                      <Lock className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <p className="flex-1">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="w-full space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Email or Username
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Email or username"
                          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Password</label>
                        <Link to="/forgot-password" className="text-[11px] text-indigo-600 hover:underline font-semibold">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
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

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all mt-2"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  <div className="text-center pt-2 text-xs text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-indigo-600 hover:underline font-bold">
                      Create free account
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
