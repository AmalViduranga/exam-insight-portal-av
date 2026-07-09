import { useAuth } from '../contexts/AuthContext';
import { useAnalysis } from '../contexts/AnalysisContext';
import { Card, CardContent, Button } from '../components/ui';
import { Users, FileSpreadsheet, Activity, ListOrdered, UploadCloud, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { user } = useAuth();
  const { processedData, clearAnalysis } = useAnalysis();

  const stats = [
    { title: 'Total Users', value: '4', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Active Users', value: '3', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Total Reports', value: '12', icon: FileSpreadsheet, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { title: 'Recent Uploads', value: '2', icon: UploadCloud, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  const quickActions = [
    { label: 'Create New User', desc: 'Add admins or users', icon: Users, path: '/admin/users' },
    { label: 'Upload Excel Sheet', desc: 'Import raw exam data', icon: UploadCloud, path: '/dashboard/upload' },
    { label: 'View Reports', desc: 'School & subject stats', icon: FileText, path: '/dashboard/reports' },
    { label: 'Subject Ranking', desc: 'Pass rates & ranks', icon: ListOrdered, path: '/dashboard/rankings' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.fullName}</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage users, upload result sheets, generate reports, and monitor system activity.</p>
        </div>
      </div>

      {processedData && (
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-white shadow-md relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-700" />
                  </div>
                  Active Analysis Session
                </h3>
                <p className="text-slate-600 mb-4">
                  <strong>Source File:</strong> <span className="text-slate-900 font-medium">{processedData.job?.originalFileName || processedData.metrics?.sheetName || 'Recent Upload'}</span>
                </p>
                <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
                  <span className="bg-white px-4 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {processedData.metrics?.totalRowsRead || 0} Rows Parsed
                  </span>
                  <span className="bg-white px-4 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    {Object.keys(processedData.metrics?.schools || {}).length} Schools Detected
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link to="/dashboard/rankings" className="w-full sm:w-auto">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-sm">Continue Analysis</Button>
                </Link>
                <Button variant="outline" onClick={clearAnalysis} className="w-full sm:w-auto text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 h-11 px-6 bg-white">
                  <X className="w-4 h-4 mr-1.5" /> Clear Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className={`shadow-sm border-slate-200 hover:shadow-md transition-shadow rounded-2xl`}>
            <CardContent className="p-6 flex items-center gap-5">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${s.bg} ${s.color} border ${s.border} shadow-inner`}>
                <s.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{s.title}</p>
                <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.path} className="group outline-none">
              <Card className="h-full border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer rounded-2xl bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-10 group-hover:bg-indigo-50 transition-colors"></div>
                <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-slate-500 border border-slate-100 group-hover:border-transparent">
                    <action.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-bold text-lg text-slate-800 block mb-1 group-hover:text-indigo-700 transition-colors">{action.label}</span>
                    <span className="text-sm text-slate-500 font-medium">{action.desc}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Recent Activity empty state */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
        <Card className="border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50 rounded-2xl">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              <Activity className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-xl font-bold text-slate-800 mb-2">No recent activity</p>
            <p className="text-slate-500 max-w-md text-base">When users upload sheets, generate reports, or system events occur, recent activity will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
