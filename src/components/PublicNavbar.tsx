import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui';
import { Menu, X, FileSpreadsheet, Sparkles, LayoutDashboard, ArrowRight } from 'lucide-react';

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
              Excel Insight
            </span>
            <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
              Intelligence Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/analyze"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Universal Analyzer
          </Link>
          <Link
            to="/exam-analyzer"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Exam Suite
          </Link>
          <Link
            to="/features"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Pricing
          </Link>
          <Link
            to="/security"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Security
          </Link>
        </nav>

        {/* Auth / Action CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="h-9 px-4 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-200">
                <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-9 px-3.5 font-semibold text-slate-700 hover:text-slate-900">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="h-9 px-4 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-200">
                  Get Started Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl px-4 py-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/analyze"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-semibold text-slate-800 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" /> Universal Analyzer
          </Link>
          <Link
            to="/exam-analyzer"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-semibold text-slate-800 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-50"
          >
            Exam Insight Suite
          </Link>
          <Link
            to="/features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-semibold text-slate-800 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-50"
          >
            Features & Capabilities
          </Link>
          <Link
            to="/pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-semibold text-slate-800 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-50"
          >
            Pricing Plans
          </Link>
          <Link
            to="/security"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-semibold text-slate-800 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-50"
          >
            Enterprise Security & Privacy
          </Link>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full justify-center h-11 bg-indigo-600 text-white rounded-xl">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center h-11 rounded-xl">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-center h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                    Create Free Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
