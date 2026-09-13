import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalysis } from '../contexts/AnalysisContext';
import { api } from '../lib/api';
import { Card, CardContent, Button } from '../components/ui';
import {
  UploadCloud,
  FileText,
  ListOrdered,
  X,
  Sparkles,
  Database,
  FileSpreadsheet,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function UserDashboard() {
  const { user } = useAuth();
  const { processedData, clearAnalysis } = useAnalysis();

  const [savedDatasets, setSavedDatasets] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [datasetsRes, reportsRes] = await Promise.allSettled([
          api.get('/universal/datasets?limit=5'),
          api.get('/analysis/results?limit=5'),
        ]);

        if (datasetsRes.status === 'fulfilled' && datasetsRes.value.data?.datasets) {
          setSavedDatasets(datasetsRes.value.data.datasets);
        }

        if (reportsRes.status === 'fulfilled' && reportsRes.value.data) {
          const repData = reportsRes.value.data.data || reportsRes.value.data;
          if (Array.isArray(repData)) {
            setRecentReports(repData.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Failed to load user dashboard data', err);
      }
    };

    fetchUserData();
  }, []);

  const actions = [
    {
      label: 'Universal Analyzer',
      desc: 'Explore any spreadsheet (.xlsx, .csv)',
      icon: Sparkles,
      path: '/analyze',
      color: 'bg-indigo-600 text-white',
      highlight: true,
    },
    {
      label: 'Upload Exam Results',
      desc: 'Ministry school & subject analysis',
      icon: UploadCloud,
      path: '/dashboard/upload',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Subject Rankings',
      desc: 'Pass rates & school leaderboards',
      icon: ListOrdered,
      path: '/dashboard/rankings',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Saved Reports',
      desc: 'View and export generated reports',
      icon: FileText,
      path: '/dashboard/reports',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Analyst Cloud Workspace
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user?.fullName}
          </h1>
          <p className="text-slate-500 text-sm">
            Analyze generic spreadsheets, persist datasets, generate subject rankings, and export clean reports.
          </p>
        </div>

        <div className="relative z-10">
          <Link to="/analyze">
            <Button className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200">
              <Sparkles className="w-4 h-4 mr-2" /> Open Universal Analyzer
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Exam Session Card if active */}
      {processedData && (
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/70 to-white shadow-xs rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-700" />
                  Active Ministry Exam Session
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  <strong>Source File:</strong>{' '}
                  <span className="text-slate-900 font-medium">
                    {processedData.job?.originalFileName || 'Recent Upload'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-700">
                  <span className="bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {processedData.metrics?.totalRowsRead || 0} Rows Parsed
                  </span>
                  <span className="bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {Object.keys(processedData.metrics?.schools || {}).length} Schools Detected
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link to="/dashboard/rankings" className="w-full sm:w-auto">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 px-6 font-semibold shadow-xs">
                    Continue Rankings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={clearAnalysis}
                  className="w-full sm:w-auto text-rose-600 hover:bg-rose-50 border-rose-200 h-10 px-5 font-semibold"
                >
                  <X className="w-4 h-4 mr-1.5" /> Clear Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Launch Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Platform Capabilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, i) => (
            <Link key={i} to={action.path} className="group outline-none">
              <Card
                className={`h-full border rounded-2xl transition-all cursor-pointer overflow-hidden p-1 ${
                  action.highlight
                    ? 'border-indigo-300 bg-indigo-50/30 hover:border-indigo-500 hover:shadow-md'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.color} shadow-xs`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    {action.highlight && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                        Universal
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-base text-slate-800 block mb-1 group-hover:text-indigo-600 transition-colors">
                      {action.label}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{action.desc}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Section: Saved Cloud Datasets & Recent Generated Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saved Datasets */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Saved Cloud Datasets
            </h3>
            <Link to="/analyze" className="text-xs text-indigo-600 font-semibold hover:underline">
              + New Dataset
            </Link>
          </div>
          <CardContent className="p-0">
            {savedDatasets.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                <Database className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No saved datasets in your cloud storage yet.</p>
                <Link to="/analyze">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs">
                    Upload to Universal Analyzer
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {savedDatasets.map((d: any) => (
                  <div key={d.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 truncate block">{d.name}</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        {d.rowCount?.toLocaleString()} rows • {d.columnCount} columns
                      </span>
                    </div>
                    <Link to="/analyze">
                      <Button variant="outline" size="sm" className="text-xs h-8 px-3 rounded-lg">
                        Explore
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Generated Reports */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Recent Analysis Reports
            </h3>
            <Link to="/dashboard/reports" className="text-xs text-indigo-600 font-semibold hover:underline">
              View All
            </Link>
          </div>
          <CardContent className="p-0">
            {recentReports.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No reports generated yet.</p>
                <Link to="/dashboard/upload">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs">
                    Upload Exam File
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {recentReports.map((r: any) => (
                  <div key={r.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 truncate block">{r.title}</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString()} • {r.job?.originalFileName || 'Exam data'}
                      </span>
                    </div>
                    <Link to="/dashboard/reports">
                      <Button variant="outline" size="sm" className="text-xs h-8 px-3 rounded-lg">
                        Export
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
