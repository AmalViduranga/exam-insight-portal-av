import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui';
import { Menu, X } from 'lucide-react';

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
        {/* Logo and Branding */}
        <Link to="/" className="flex items-center gap-2" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Exam Insight Portal</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollToSection('request-access')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Request Access
          </button>
          <Link to="/login">
            <Button size="sm" className="h-9 px-4 font-medium shadow-sm">
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg px-4 py-4 flex flex-col gap-4">
          <button onClick={() => scrollToSection('features')} className="text-left font-medium text-slate-700 hover:text-indigo-600 p-2 rounded-md hover:bg-slate-50 transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-left font-medium text-slate-700 hover:text-indigo-600 p-2 rounded-md hover:bg-slate-50 transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollToSection('request-access')} className="text-left font-medium text-slate-700 hover:text-indigo-600 p-2 rounded-md hover:bg-slate-50 transition-colors">
            Request Access
          </button>
          <div className="pt-2 border-t border-slate-100">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full justify-center h-11">
                Login to Portal
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
