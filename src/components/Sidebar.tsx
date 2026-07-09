import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BarChart3, 
  ListOrdered, 
  Users,
  LogOut,
  X,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { Button } from './ui';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'USER'] },
    { label: 'Upload Excel', icon: UploadCloud, path: '/dashboard/upload', roles: ['ADMIN', 'USER'] },
    { label: 'Subject Rankings', icon: ListOrdered, path: '/dashboard/rankings', roles: ['ADMIN', 'USER'] },
    { label: 'All Reports', icon: BarChart3, path: '/dashboard/reports', roles: ['ADMIN', 'USER'] },
    { label: 'User Management', icon: Users, path: '/admin/users', roles: ['ADMIN'] },
  ];

  const visibleNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl lg:shadow-none lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding / Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 leading-tight">Exam Insight Portal</span>
              <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">Result Analytics</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="lg:hidden px-2 text-slate-500 hover:bg-slate-100">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                    /* We can't access isActive outside className easily in React Router v6 without rendering a function for children, 
                       so we rely on parent text color to cascade, or keep it simple. */
                    ""
                  }`} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile / Logout (Desktop & Mobile) */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {user?.fullName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <span className="text-sm font-bold text-slate-900 truncate leading-tight">{user?.fullName}</span>
              <span className="text-xs font-medium text-slate-500 truncate flex items-center gap-1 mt-0.5">
                {user?.role === 'ADMIN' ? (
                  <><Shield className="w-3 h-3 text-indigo-500" /> Administrator</>
                ) : (
                  <><UserIcon className="w-3 h-3 text-blue-500" /> User</>
                )}
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-center bg-white border-slate-200 text-slate-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors h-10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
