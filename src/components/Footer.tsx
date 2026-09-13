import { Link } from 'react-router-dom';
import { FileSpreadsheet, ShieldCheck, Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-12 mt-auto shrink-0">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Excel Insight</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Universal Excel & CSV intelligence platform. Explore, filter, visualize, and export data from any spreadsheet instantly.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Enterprise RLS & Safe DDE
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Solutions</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/analyze" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Universal Analyzer
                </Link>
              </li>
              <li>
                <Link to="/features/excel-filter" className="hover:text-indigo-600 transition-colors">
                  Smart Dynamic Filtering
                </Link>
              </li>
              <li>
                <Link to="/exam-analyzer" className="hover:text-indigo-600 transition-colors">
                  Ministry Exam Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & SEO Pages */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/features" className="hover:text-indigo-600 transition-colors">
                  Features Overview
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-indigo-600 transition-colors">
                  Pricing & Limits
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-indigo-600 transition-colors">
                  Security & Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Account</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/login" className="hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-indigo-600 transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
                  Cloud Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Excel Insight Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by{' '}
            <a
              href="https://www.linkedin.com/in/amal-viduranga-3a681b27b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Amal Viduranga
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
