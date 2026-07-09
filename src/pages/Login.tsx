import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, Button, Input } from '../components/ui';
import { Lock, User as UserIcon, ArrowLeft, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/login', { username, password });
      await checkAuth();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full relative">
      {/* Main Content (Two Column Layout) */}
      <main className="flex-1 flex flex-col p-4 relative overflow-hidden items-center justify-center min-h-[calc(100vh-64px)]">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="w-full max-w-5xl flex flex-col relative z-10">
          <div className="mb-6 self-start md:hidden">
            <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center w-full">
          
          {/* Left Intro / Features */}
          <div className="hidden md:flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-indigo-600 mb-6 text-sm font-semibold tracking-wide border border-indigo-100 shadow-sm self-start">
              <ShieldCheck className="w-4 h-4" /> Secure Access Only
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Secure Result <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Analytics</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Upload Excel result sheets, generate school-wise and subject-wise reports, and export ranked performance summaries.
            </p>
            <ul className="space-y-4">
              {[
                'Admin-controlled access',
                'Formula-based result calculations',
                'Subject-wise school rankings',
                'Excel and CSV exports'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Login Card */}
          <div className="flex justify-center w-full">
            <Card className="w-full max-w-md shadow-2xl border-slate-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
              <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center">
                
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Welcome back</h2>
                <p className="text-slate-500 text-center mb-6 font-medium text-sm">
                  Sign in with your administrator-provided account.
                </p>

                {error && (
                  <div className="w-full bg-rose-50 text-rose-800 px-4 py-3.5 rounded-xl mb-6 text-sm font-medium border border-rose-200 shadow-sm flex items-start gap-2.5">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <p className="flex-1 leading-snug">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="w-full space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                    <div className="relative">
                      <UserIcon className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                      <Input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        placeholder="Enter your username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 pr-11 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-semibold shadow-md mt-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
                  <p className="text-sm text-slate-500 font-medium">
                    Need an account?{' '}
                    <Link to="/#request-access" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                      Contact administrator
                    </Link>
                  </p>
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
