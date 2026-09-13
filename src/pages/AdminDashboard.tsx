import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalysis } from '../contexts/AnalysisContext';
import { api } from '../lib/api';
import { Card, CardContent, Button } from '../components/ui';
import {
  Users,
  UploadCloud,
  FileText,
  X,
  Database,
  HardDrive,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDatasets: number;
  totalReports: number;
  totalUploads: number;
  totalStorageBytes: number;
  totalStorageFormatted: string;
  fileTypeCounts: Record<string, number>;
  popularDataTypes: Record<string, number>;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const { processedData, clearAnalysis } = useAnalysis();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [recentDatasets, setRecentDatasets] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data && res.data.success) {
          setStats(res.data.stats);
          setRecentLogs(res.data.recentLogs || []);
          setRecentDatasets(res.data.recentDatasets || []);
        }
      } catch (err) {
        console.error('Failed to load admin live stats', err);
      }
    };
    fetchAdminData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '1',
      subtitle: `${stats?.activeUsers || 1} active`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Cloud Datasets',
      value: stats?.totalDatasets?.toLocaleString() || '0',
      subtitle: 'Stored in Supabase',
      icon: Database,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      title: 'Total Uploads',
      value: stats?.totalUploads?.toLocaleString() || '0',
      subtitle: 'Spreadsheet files processed',
      icon: UploadCloud,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Storage Used',
      value: stats?.totalStorageFormatted || '0 B',
      subtitle: 'Private bucket storage',
      icon: HardDrive,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> System Administration Console
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-slate-500 text-sm">
            Live database telemetry, user management, storage metrics, and system audit logs.
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          <Link to="/analyze">
            <Button className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 mr-1.5" /> Open Analyzer
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="outline" className="h-10 px-4 rounded-xl bg-white border-slate-200 font-semibold">
              <Users className="w-4 h-4 mr-1.5" /> Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Real-time Dynamic Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((st, i) => {
          const Icon = st.icon;
          return (
            <Card key={i} className={`border rounded-2xl bg-white shadow-xs p-1 ${st.border}`}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {st.title}
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 block font-mono">
                    {st.value}
                  </span>
                  <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                    {st.subtitle}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${st.bg} flex items-center justify-center ${st.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Session Card if data is in memory */}
      {processedData && (
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/70 to-white shadow-xs rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Active Ministry Exam Session
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  <strong>Source File:</strong> {processedData.job?.originalFileName || 'Recent Upload'}
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                  <span className="bg-white px-3 py-1 rounded-lg border border-slate-200">
                    {processedData.metrics?.totalRowsRead || 0} Rows Parsed
                  </span>
                  <span className="bg-white px-3 py-1 rounded-lg border border-slate-200">
                    {Object.keys(processedData.metrics?.schools || {}).length} Schools Detected
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/dashboard/rankings">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-5 rounded-xl text-xs font-semibold">
                    View Rankings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={clearAnalysis}
                  className="text-rose-600 hover:bg-rose-50 border-rose-200 h-10 px-4 rounded-xl text-xs font-semibold"
                >
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout: Recent Datasets & Audit Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Cloud Datasets */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Recent Cloud Datasets
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Supabase Storage</span>
          </div>
          <CardContent className="p-0">
            {recentDatasets.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                No datasets saved yet. Upload and save a spreadsheet from the Universal Analyzer.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {recentDatasets.map((d: any) => (
                  <div key={d.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 truncate block">{d.name}</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        {d.rowCount?.toLocaleString()} rows • Uploaded by {d.uploaderName}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] shrink-0 font-mono">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live System Audit Logs */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Live Audit Log Stream
            </h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
            </span>
          </div>
          <CardContent className="p-0">
            {recentLogs.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">No audit logs recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs max-h-96 overflow-y-auto">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {log.action}
                        </span>
                        <span className="text-slate-700 font-semibold">{log.userName}</span>
                      </div>
                      {log.ipAddress && (
                        <span className="text-slate-400 text-[10px] font-mono block mt-0.5">
                          IP: {log.ipAddress}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[10px] font-mono shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
