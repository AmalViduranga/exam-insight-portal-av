import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Card, CardContent, Button, Badge } from "../components/ui";
import { BarChart3, DownloadCloud, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

export function AllReportsList() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/analysis/results');
        setReports(res.data);
      } catch (err: any) {
        addToast("Failed to load reports", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [addToast]);

  const handleExportExcel = (id: string) => {
    window.location.href = `${api.defaults.baseURL}/analysis/results/${id}/export/xlsx`;
  };

  const handleExportCSV = (id: string) => {
    window.location.href = `${api.defaults.baseURL}/analysis/results/${id}/export/csv`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-bold text-slate-900">Loading Reports</h3>
        <p className="text-slate-500 mt-1">Retrieving your saved analysis reports...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="pt-8">
        <Card className="border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50 rounded-2xl">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              <BarChart3 className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-slate-800 mb-2">No Reports Generated</p>
            <p className="text-slate-500 max-w-md text-base mb-8">You haven't generated any reports yet. Upload an Excel file and generate a report from the Subject Rankings page.</p>
            
            <div className="flex justify-center gap-4">
              <Link to="/dashboard/upload">
                <Button variant="outline" className="h-11 px-6 rounded-xl bg-white font-semibold">Upload Excel</Button>
              </Link>
              <Link to="/dashboard/rankings">
                <Button className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-sm">Go to Rankings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Generated Reports</h1>
          <p className="text-slate-500">View and export all previously generated subject rankings and reports.</p>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-4 py-1.5 text-sm font-bold shadow-sm rounded-full">
          {reports.length} Reports Total
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {reports.map((report) => (
          <Card key={report.id} className="shadow-sm border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all rounded-2xl overflow-hidden group">
            <CardContent className="p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{report.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="truncate max-w-[200px] sm:max-w-xs" title={report.job?.originalFileName}>
                        Source: <span className="text-slate-700">{report.job?.originalFileName || 'Unknown Data'}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Subjects Analyzed:</span>
                    {report.selectedSubjects.map((sub: string) => (
                      <Badge key={sub} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 px-2 py-0.5 font-semibold">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                <Button variant="outline" onClick={() => handleExportCSV(report.id)} className="flex-1 lg:flex-none h-11 px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm border-slate-200">
                  <DownloadCloud className="w-4 h-4 mr-2 text-slate-400" /> CSV
                </Button>
                <Button onClick={() => handleExportExcel(report.id)} className="flex-1 lg:flex-none h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm shadow-emerald-200">
                  <DownloadCloud className="w-4 h-4 mr-2" /> Excel
                </Button>
              </div>
              
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
