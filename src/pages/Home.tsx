import { useState, type DragEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Sparkles,
  Sliders,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '../components/ui';

export function Home() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Redirect directly to /analyze
    navigate('/analyze');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Hero Section: Modern SaaS Style */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pt-16 pb-24 lg:pt-28 lg:pb-32">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-200/40 blur-[130px]" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 shadow-xs text-xs font-bold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Universal Excel & CSV Intelligence Platform
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Upload Any Excel File.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700">
                Discover Insights Instantly.
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
              No fixed template required. Automatically detect headers, infer data types, generate smart filters, and visualize distributions in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link to="/analyze">
                <Button size="lg" className="h-13 px-8 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all">
                  Launch Free Analyzer <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/exam-analyzer">
                <Button variant="outline" size="lg" className="h-13 px-8 text-base font-semibold bg-white border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50">
                  Exam Result Suite
                </Button>
              </Link>
            </div>

            {/* Free Tier Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Account Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Supports .xlsx, .xls, .csv
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Formula Injection Safe
              </span>
            </div>
          </div>

          {/* Interactive Hero Upload Card / Live Preview */}
          <div className="mt-14 max-w-5xl mx-auto">
            <Link to="/analyze" className="block group">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-3xl bg-white border-2 transition-all p-8 sm:p-12 shadow-xl ${
                  dragActive
                    ? 'border-indigo-600 bg-indigo-50/20 scale-[1.01]'
                    : 'border-slate-200/80 hover:border-indigo-300 hover:shadow-2xl'
                }`}
              >
                {/* Decorative Window Controls */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-slate-400 ml-3 hidden sm:inline">
                      Excel Insight Platform - Dynamic Schema Detector
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-bold">
                    Instant Interactive Mode
                  </Badge>
                </div>

                {/* Dropzone Body */}
                <div className="py-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Drop your spreadsheet here to explore immediately
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Works with sales records, student marks, inventory lists, financial transactions & more
                    </p>
                  </div>
                  <Button className="h-10 px-6 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-semibold">
                    Open Spreadsheet in Analyzer
                  </Button>
                </div>

                {/* Simulated dynamic filter pills */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2.5 text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Auto-generated Filters:
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-amber-500" /> District: Colombo, Galle...
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-blue-500" /> Revenue: $18,000 - $64,000
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Status: Active, Pending
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Section: Automatic Data Understanding */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
              Smart Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Automatic Data Understanding
            </h2>
            <p className="text-slate-600 text-base">
              Say goodbye to broken uploads caused by non-standard spreadsheets. Our parser dynamically identifies structure without hard-coded assumptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="rounded-3xl border-slate-200/80 shadow-xs hover:shadow-md transition-all p-2 bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Header & Title Detection</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Excel files with company logos, decorative top banners, or blank rows are detected automatically. The parser locates the true column header row using statistical confidence scoring.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 shadow-xs hover:shadow-md transition-all p-2 bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Type & Cardinality Inference</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Classifies every column into <strong>percentage</strong>, <strong>number</strong>, <strong>date</strong>, <strong>category</strong>, <strong>boolean</strong>, or <strong>text</strong>. Computes distinct frequency maps and min/max ranges.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 shadow-xs hover:shadow-md transition-all p-2 bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Multi-Sheet & Missing Values</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Workbooks with multiple tabs are extracted with full sheet navigation. Blank cells, duplicate column headers, and sparse rows are normalized cleanly without crashing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Section: Smart Filtering Showcase */}
      <section className="py-24 bg-slate-50/60 border-t border-slate-200/80">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
                <Sliders className="w-3.5 h-3.5" /> Dynamic Filter Generator
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Filters Tailored Directly to Your Data Schema
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Rather than forcing a rigid filter form, our platform generates adaptive interactive controls based on what each column actually contains.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Discrete Values → Categorical Dropdowns</h4>
                    <p className="text-xs text-slate-500">
                      Columns like District, Department, or Grade render searchable multi-select lists with instant frequency counts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Numeric Values → Dual-Thumb Range Sliders</h4>
                    <p className="text-xs text-slate-500">
                      Columns like Revenue, Age, or Score automatically get min-max boundary controls with live averages.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Date Columns → Calendar Interval Pickers</h4>
                    <p className="text-xs text-slate-500">
                      Dates render start-to-end calendar pickers that handle both ISO strings and Excel serial date integers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/features/excel-filter">
                  <Button variant="outline" className="rounded-xl border-slate-300 font-semibold text-slate-700">
                    Learn more about dynamic filtering <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Simulation of Dynamic Filter Panel */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" /> Active Dynamic Controls
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  Sample: Employee Directory
                </span>
              </div>

              {/* Sample 1: Category */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Department Filter (Category)</span>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">
                    3 Selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-semibold text-[11px]">
                    Engineering (45)
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-semibold text-[11px]">
                    Marketing (22)
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-200/70 text-slate-700 font-medium text-[11px]">
                    Finance (14)
                  </span>
                </div>
              </div>

              {/* Sample 2: Number Slider */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Salary Range ($)</span>
                  <span className="text-[11px] font-mono text-slate-600">$50,000 - $180,000</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full relative">
                  <div className="absolute left-[20%] right-[25%] top-0 bottom-0 bg-indigo-600 rounded-full" />
                </div>
              </div>

              {/* Sample 3: Boolean Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Employment Status</span>
                <div className="flex gap-2 text-xs">
                  <button className="flex-1 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-[11px]">
                    Active (84)
                  </button>
                  <button className="flex-1 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium text-[11px]">
                    On Leave (8)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: Visualizations & Clean Export */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
              Actionable Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Instant Charts & Clean Formula-Safe Exports
            </h2>
            <p className="text-slate-600 text-base">
              Turn raw tabular data into intuitive visual insights with a single click, then download filtered results safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="rounded-3xl border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Automatic Distribution Charts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                View category frequency breakdowns and distribution rankings rendered directly in your browser with responsive SVG charts.
              </p>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Filtered Excel & CSV Downloads</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Export exactly what is filtered on screen to clean <strong>.xlsx</strong> workbooks or standardized <strong>.csv</strong> files for reporting.
              </p>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Formula Injection Protection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Protects against CSV and DDE formula injection exploits (=, +, -, @). Malicious payloads are automatically sanitized on export.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Section: Secure Workspace & Preserved Exam Module */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-indigo-300">
                <Lock className="w-3.5 h-3.5" /> Supabase Row Level Security
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Secure Cloud Workspace for Registered Users
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Free public users enjoy zero-retention temporary analysis. Registered users get permanent private datasets, custom saved filter templates, larger 25MB uploads, and comprehensive audit trails.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link to="/signup">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-12 px-8 font-bold">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/security">
                  <Button variant="outline" size="lg" className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl h-12 px-6 font-semibold">
                    Review Security Posture
                  </Button>
                </Link>
              </div>
            </div>

            {/* Comparison Cards: Public vs Registered */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Public Free Mode
                </span>
                <span className="text-xl font-bold text-white block">Zero Setup</span>
                <ul className="space-y-2 text-xs text-slate-300 pt-2">
                  <li>✓ No account needed</li>
                  <li>✓ Up to 5MB file sizes</li>
                  <li>✓ Up to 10,000 rows</li>
                  <li>✓ Dynamic smart filters</li>
                  <li>✓ Excel & CSV export</li>
                  <li className="text-slate-500">✕ Cloud dataset save</li>
                </ul>
              </div>

              <div className="bg-gradient-to-b from-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-3 shadow-lg">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  Registered Analyst
                </span>
                <span className="text-xl font-bold text-white block">Cloud Workspace</span>
                <ul className="space-y-2 text-xs text-indigo-100 pt-2">
                  <li>✓ Everything in Free</li>
                  <li>✓ Up to 25MB file sizes</li>
                  <li>✓ Up to 100,000 rows</li>
                  <li>✓ Private Supabase Storage</li>
                  <li>✓ Save Custom Filters</li>
                  <li>✓ Ministry Exam Result Suite</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
