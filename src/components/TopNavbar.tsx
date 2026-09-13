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
    if (path === '/dashboard') return 'Platform Dashboard';
    if (path.includes('/dashboard/upload')) return 'Upload Exam Results';
    if (path.includes('/dashboard/rankings')) return 'Subject Rankings';
    if (path.includes('/dashboard/reports')) return 'Generated Reports';
    if (path.includes('/admin/users')) return 'User Management & Access';
    if (path.includes('/analyze')) return 'Universal Excel Analyzer';
    return 'Excel Insight Workspace';
  };

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 h-16 shrink-0 flex items-center shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full gap-4">
        
        {/* Left Side: Mobile Menu Toggle & Page Title */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button 
              onClick={onMenuClick} 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight hidden sm:block">{getPageTitle()}</h1>
            <h1 className="text-base font-bold text-slate-900 tracking-tight sm:hidden">Excel Insight</h1>
          </div>
        </div>

        {/* Right Side: User Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800 leading-tight">{user.fullName}</span>
                <span className="text-[11px] text-slate-500 font-medium leading-tight flex items-center gap-1 mt-0.5">
                  {user.role === 'ADMIN' ? (
                    <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                      <User className="w-3 h-3" /> Member
                    </span>
                  )}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-xs">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-2.5 h-8 rounded-lg transition-colors ml-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4 md:mr-1.5" />
            <span className="hidden md:inline text-xs font-semibold">Logout</span>
          </Button>
        </div>
        
      </div>
    </header>
  );
}
