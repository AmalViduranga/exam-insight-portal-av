import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, Button, Badge } from '../components/ui';
import {
  BarChart3,
  DownloadCloud,
  Calendar,
  FileText,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export function AllReportsList() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { addToast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analysis/results?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      if (res.data) {
        if (Array.isArray(res.data)) {
          setReports(res.data);
          setTotalCount(res.data.length);
          setTotalPages(1);
        } else {
          setReports(res.data.data || []);
          setTotalCount(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      }
    } catch {
      addToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, search]);

  const handleDeleteReport = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the report "${title}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/analysis/results/${id}`);
      addToast('Report deleted successfully.', 'success');
      setReports((prev) => prev.filter((r) => r.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to delete report', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportExcel = (id: string) => {
    window.location.href = `${api.defaults.baseURL}/analysis/results/${id}/export/xlsx`;
  };

  const handleExportCSV = (id: string) => {
    window.location.href = `${api.defaults.baseURL}/analysis/results/${id}/export/csv`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Generated Analysis Reports
          </h1>
          <p className="text-slate-500 text-sm">
            View, search, manage, and export previously generated school and subject rankings.
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-indigo-50 text-indigo-700 border-indigo-200 px-4 py-1.5 text-xs font-bold shadow-xs rounded-full"
        >
          {totalCount} Total Reports
        </Badge>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reports by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <Link to="/dashboard/upload">
            <Button className="h-9 px-4 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
              + Generate New Report
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <h3 className="text-base font-bold text-slate-900">Loading Reports</h3>
          <p className="text-xs text-slate-500 mt-1">Retrieving analysis reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50 rounded-3xl">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xs border border-slate-100">
              <BarChart3 className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-slate-800 mb-1">No Reports Found</p>
            <p className="text-xs text-slate-500 max-w-md mb-6">
              {search ? 'No reports matched your search criteria.' : 'You haven\'t generated any reports yet.'}
            </p>
            <Link to="/dashboard/upload">
              <Button className="rounded-xl h-10 px-6 font-semibold bg-indigo-600 text-white">
                Upload & Analyze Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="shadow-xs border-slate-200/80 hover:border-indigo-200 transition-all rounded-2xl overflow-hidden bg-white group"
              >
                <CardContent className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 truncate">{report.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          <span className="truncate max-w-[200px]" title={report.job?.originalFileName}>
                            Source: {report.job?.originalFileName || 'Exam data'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                          Subjects:
                        </span>
                        {report.selectedSubjects?.map((sub: string) => (
                          <Badge
                            key={sub}
                            variant="outline"
                            className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] px-2 py-0.5 font-semibold"
                          >
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Export & Delete Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportCSV(report.id)}
                      className="flex-1 lg:flex-none h-9 px-3 rounded-xl bg-white text-slate-700 font-semibold text-xs border-slate-200"
                    >
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleExportExcel(report.id)}
                      className="flex-1 lg:flex-none h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                    >
                      <DownloadCloud className="w-3.5 h-3.5 mr-1" /> Excel
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === report.id}
                      onClick={() => handleDeleteReport(report.id, report.title)}
                      className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 rounded-lg"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2.5 rounded-lg"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
