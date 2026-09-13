import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Hash, Calendar, ToggleLeft } from 'lucide-react';
import { Button } from '../../components/ui';

export function ExcelFilterPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-16">
      <div className="container mx-auto px-4 max-w-5xl space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
            Smart Dynamic Filter Engine
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            How Dynamic Excel Filtering Works
          </h1>
          <p className="text-slate-600 text-lg">
            Traditional tools force you to configure filters manually. Excel Insight Platform scans your uploaded spreadsheet and synthesizes context-aware interactive controls automatically.
          </p>
        </div>

        {/* Filter Type Breakdown */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Categorical Dropdowns & Multi-Select</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When a column contains low-cardinality discrete strings (e.g. <em>District: Colombo, Galle, Kandy</em> or <em>Department: Sales, Support</em>), the system creates a searchable multi-select checklist showing exact row frequencies for every choice.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Hash className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Numeric Dual Range Sliders</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Columns with numeric or percentage values (e.g. <em>Age: 18 - 65</em>, <em>Price: $10 - $2,500</em>, <em>Attendance: 0% - 100%</em>) automatically generate dual min/max inputs with real-time distribution averages.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Date Range Filters</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dates in standard formats (ISO strings, YYYY-MM-DD, DD/MM/YYYY, or Excel date numbers) are mapped to from-to date pickers, allowing precise chronological slicing.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <ToggleLeft className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Boolean Status Toggles</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Flags with binary options (<em>Yes/No, True/False, Active/Inactive, 1/0</em>) render quick 3-way toggle buttons: All, True, or False.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link to="/analyze">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold h-12 px-8 shadow-md shadow-indigo-200">
              Try Dynamic Filtering Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
