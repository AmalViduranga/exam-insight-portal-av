import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield, Menu } from 'lucide-react';
import { Button } from './ui';

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.includes('/dashboard/upload')) return 'Upload Excel';
    if (path.includes('/dashboard/rankings')) return 'Subject Rankings';
    if (path.includes('/dashboard/reports')) return 'All Reports';
    if (path.includes('/admin/users')) return 'User Management';
    return 'Portal';
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 h-20 shrink-0 flex items-center shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full gap-4">
        
        {/* Left Side: Mobile Menu Toggle & Page Title */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button 
              onClick={onMenuClick} 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">{getPageTitle()}</h1>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight sm:hidden">Exam Insight Portal</h1>
          </div>
        </div>

        {/* Right Side: User Actions (Desktop/Mobile adapted) */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800 leading-tight">{user.fullName}</span>
                <span className="text-xs text-slate-500 font-medium leading-tight flex items-center gap-1 mt-0.5">
                  {user.role === 'ADMIN' ? (
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <User className="w-3 h-3" /> User
                    </span>
                  )}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3 h-10 rounded-lg transition-colors ml-2"
            title="Logout"
          >
            <LogOut className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline font-medium">Logout</span>
          </Button>
        </div>
        
      </div>
    </header>
  );
}
