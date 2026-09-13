import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent } from '../../components/ui';

export function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
            Simple, Transparent Tiers
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Start Free. Scale With Cloud Storage.
          </h1>
          <p className="text-slate-600 text-lg">
            Use the platform completely free with no account required for quick exploration, or sign up to unlock persistent cloud datasets and advanced tools.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* 1. Public Free */}
          <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white flex flex-col p-2">
            <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Public Free Mode
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="text-xs text-slate-500 font-medium">/ forever</span>
                </div>
                <p className="text-xs text-slate-600">
                  Ideal for quick, ad-hoc spreadsheet exploration with zero signup friction.
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>No account required</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to <strong>5MB</strong> file size</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to <strong>10,000</strong> rows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dynamic smart filters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Excel (.xlsx) & CSV export</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-4 h-4 text-center">✕</span>
                    <span>No saved dataset history</span>
                  </div>
                </div>
              </div>

              <Link to="/analyze" className="w-full block pt-4">
                <Button variant="outline" className="w-full rounded-xl h-11 font-semibold text-slate-700">
                  Try Without Account
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 2. Registered Analyst (Featured) */}
          <Card className="rounded-3xl border-2 border-indigo-600 shadow-xl bg-white flex flex-col p-2 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
              Most Popular
            </div>
            <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                  Registered Analyst
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="text-xs text-slate-500 font-medium">/ free signup</span>
                </div>
                <p className="text-xs text-slate-600">
                  Full cloud features with private storage and saved filter templates.
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Everything in Free</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to <strong>25MB</strong> file size</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to <strong>100,000</strong> rows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Save datasets to Supabase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Save custom dynamic filters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Full <strong>Ministry Exam Suite</strong></span>
                  </div>
                </div>
              </div>

              <Link to="/signup" className="w-full block pt-4">
                <Button className="w-full rounded-xl h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200">
                  Create Free Account <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 3. Enterprise */}
          <Card className="rounded-3xl border-slate-200/80 shadow-xs bg-white flex flex-col p-2">
            <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Enterprise
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">Custom</span>
                </div>
                <p className="text-xs text-slate-600">
                  Dedicated infrastructure, custom retention, and priority SLA.
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dedicated PostgreSQL instance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unlimited file uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Role-based team workspaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Custom retention & audit logs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Priority technical support</span>
                  </div>
                </div>
              </div>

              <a
                href="https://www.linkedin.com/in/amal-viduranga-3a681b27b"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block pt-4"
              >
                <Button variant="outline" className="w-full rounded-xl h-11 font-semibold text-slate-700">
                  Contact Architect
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
