import { Link } from 'react-router-dom';
import {
  Sliders,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Database,
  Layers,
} from 'lucide-react';
import { Button, Card, CardContent } from '../../components/ui';

export function FeaturesPage() {
  const featureList = [
    {
      icon: Sparkles,
      title: 'Automatic Header & Schema Detection',
      desc: 'Smart algorithms inspect the first 30 rows to accurately detect where column headers begin, cleanly ignoring company logos, decorative title banners, and blank preamble rows.',
    },
    {
      icon: Sliders,
      title: 'Dynamic Filter Generation',
      desc: 'Filters adapt directly to column data types. Low-cardinality values produce multi-select dropdowns, numeric columns generate dual-thumb range sliders, and dates produce calendar interval pickers.',
    },
    {
      icon: Layers,
      title: 'Universal Type Inference',
      desc: 'Supports text, currency/numeric values, percentages, dates, categories, and boolean flags with automatic calculation of statistical averages, maximums, minimums, and distinct frequency counts.',
    },
    {
      icon: BarChart3,
      title: 'Exploratory Visual Analytics',
      desc: 'Instant categorical breakdown bar charts and distribution visualizations rendered directly in the browser with zero heavy BI server configuration.',
    },
    {
      icon: ShieldCheck,
      title: 'DDE & Formula Injection Protection',
      desc: 'Spreadsheets containing potentially malicious Excel/CSV formula prefixes (=, +, -, @) are automatically sanitized on export to prevent code execution in spreadsheet software.',
    },
    {
      icon: Database,
      title: 'Supabase PostgreSQL & Private Storage',
      desc: 'Secure cloud workspace for registered users backed by Supabase with Row Level Security (RLS) policies guaranteeing total data isolation between users.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
            Platform Capabilities
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Designed for Universal Spreadsheet Intelligence
          </h1>
          <p className="text-slate-600 text-lg">
            Explore the powerful feature suite that turns complex, messy Excel and CSV spreadsheets into clean, interactive, and exportable dashboards.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((f, idx) => {
            const Icon = f.icon;
            return (
              <Card key={idx} className="rounded-3xl border-slate-200/80 shadow-xs hover:shadow-md transition-all p-2 bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-200">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold">Ready to analyze your spreadsheet?</h2>
            <p className="text-indigo-100 text-sm">Experience free public analysis in under 5 seconds with zero account required.</p>
          </div>
          <Link to="/analyze">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 rounded-2xl font-bold h-12 px-8 shrink-0 shadow-md">
              Launch Analyzer <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
