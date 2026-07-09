import { useAuth } from '../contexts/AuthContext';
import { useAnalysis } from '../contexts/AnalysisContext';
import { Card, CardContent, Button } from '../components/ui';
import { UploadCloud, FileText, ListOrdered, Download, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UserDashboard() {
  const { user } = useAuth();
  const { processedData, clearAnalysis } = useAnalysis();

  const actions = [
    { label: 'Upload Excel', desc: 'Import exam results', icon: UploadCloud, path: '/dashboard/upload' },
    { label: 'Generate Report', desc: 'School & subject stats', icon: FileText, path: '/dashboard/upload' },
    { label: 'Subject Rankings', desc: 'Pass rates & ranks', icon: ListOrdered, path: '/dashboard/rankings' },
    { label: 'Export Reports', desc: 'Download CSV/Excel', icon: Download, path: '/dashboard/reports' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hello, {user?.fullName}</h1>
          <p className="text-slate-500 mt-2 text-lg">Upload exam result sheets, filter results, generate rankings, and export final reports.</p>
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

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action, i) => (
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

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Subject Shortcuts</h2>
        <div className="flex flex-wrap gap-4">
          {['60', '63', '81', '84', '85', '88', '89'].map((subject) => (
            <Link key={subject} to="/dashboard/rankings">
              <Button variant="outline" className="font-semibold text-slate-700 hover:text-indigo-700 hover:border-indigo-400 bg-white shadow-sm h-12 px-6 rounded-xl hover:shadow-md transition-all">
                Subject {subject}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Reports empty state */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Reports</h2>
        <Card className="border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50 rounded-2xl">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-xl font-bold text-slate-800 mb-2">No recent reports</p>
            <p className="text-slate-500 max-w-md text-base">Generate a new report from the subject ranking or upload pages to see it here.</p>
            <Link to="/dashboard/upload" className="mt-6">
              <Button className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
                Upload Excel Data
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
