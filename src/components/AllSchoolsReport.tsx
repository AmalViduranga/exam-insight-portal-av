import { useState, useMemo } from "react";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from "./ui";
import { DownloadCloud, Loader2, Search, Trophy } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

interface AllSchoolsReportProps {
  data: any;
}

const COMMON_SUBJECTS = ["60", "63", "81", "84", "85", "88", "89"];

export function AllSchoolsReport({ data }: AllSchoolsReportProps) {
  const [subjectInput, setSubjectInput] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToast } = useToast();

  const handleCalculate = async (sub: string) => {
    setSubjectInput(sub);
    if (!sub) {
      setResults([]);
      setResultId(null);
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const res = await api.post(`/analysis/jobs/${data.jobId}/report`, {
        subjects: [sub],
        title: `All Schools Report - Subject ${sub}`
      });
      const generatedResultId = res.data.resultId;
      setResultId(generatedResultId);

      const reportRes = await api.get(`/analysis/results/${generatedResultId}`);
      
      const sortedRows = reportRes.data.rows.sort((a: any, b: any) => a.rank - b.rank);
      setResults(sortedRows);
      addToast(`Generated report for Subject ${sub}`, "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Error generating report', "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!resultId) return;
    window.location.href = `${api.defaults.baseURL}/analysis/results/${resultId}/export/xlsx`;
  };

  const handleExportCSV = async () => {
    if (!resultId) return;
    window.location.href = `${api.defaults.baseURL}/analysis/results/${resultId}/export/csv`;
  };

  const filteredResults = useMemo(() => {
    if (!searchTerm) return results;
    const lower = searchTerm.toLowerCase();
    return results.filter(r => 
      r.schoolName.toLowerCase().includes(lower) || 
      r.schoolId.toString().includes(lower)
    );
  }, [results, searchTerm]);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-5 pt-6 px-6 md:px-8">
          <CardTitle className="text-xl font-bold text-slate-900">Generate Ranking Report</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Select a subject to rank all schools based on pass percentages.</p>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <label className="block text-sm font-bold text-slate-700 mb-2">Subject Number</label>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Input
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              placeholder="e.g. 60"
              className="max-w-[300px] h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
            />
            <Button onClick={() => handleCalculate(subjectInput)} disabled={loading} className="px-8 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-sm">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trophy className="w-5 h-5 mr-2" />}
              {loading ? 'Generating...' : 'Generate Rankings'}
            </Button>
          </div>
          
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-slate-200"></span>
              Or Quick Select
              <span className="flex-1 h-px bg-slate-200"></span>
            </div>
            <div className="flex flex-wrap gap-3">
              {COMMON_SUBJECTS.map((sub) => (
                <Button
                  key={sub}
                  variant={subjectInput === sub ? "default" : "outline"}
                  onClick={() => handleCalculate(sub)}
                  disabled={loading}
                  className={`min-w-[4.5rem] h-10 rounded-lg font-semibold transition-all ${
                    subjectInput === sub 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 hover:border-indigo-300'
                  }`}
                >
                  {sub}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500">
          <CardHeader className="flex flex-col xl:flex-row items-start xl:items-center justify-between bg-white border-b border-slate-200 gap-4 py-5 px-6 md:px-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Rankings for Subject {subjectInput}</CardTitle>
                <div className="text-sm text-slate-500 font-medium mt-0.5">{results.length} Schools Analyzed</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
              <div className="relative flex-1 sm:min-w-[280px]">
                <Search className="w-5 h-5 absolute left-3.5 top-2.5 text-slate-400" />
                <Input 
                  placeholder="Search school name or ID..." 
                  className="pl-11 h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={handleExportCSV} className="h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm border-slate-200">
                  <DownloadCloud className="w-4 h-4 mr-2" /> CSV
                </Button>
                <Button onClick={handleExportExcel} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm shadow-emerald-200">
                  <DownloadCloud className="w-4 h-4 mr-2" /> Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap min-w-max">
              <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-center w-16">Rank</th>
                  <th className="px-6 py-4">School ID</th>
                  <th className="px-6 py-4">School Name</th>
                  <th className="px-4 py-4 text-right">Sat</th>
                  <th className="px-4 py-4 text-right">A</th>
                  <th className="px-4 py-4 text-right">B</th>
                  <th className="px-4 py-4 text-right">C</th>
                  <th className="px-4 py-4 text-right">S</th>
                  <th className="px-4 py-4 text-right">W</th>
                  <th className="px-4 py-4 text-right">Absent</th>
                  <th className="px-6 py-4 text-right text-emerald-800 bg-emerald-50/50">Pass Count</th>
                  <th className="px-6 py-4 text-right text-emerald-800 bg-emerald-100/50">Pass %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No schools found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r, i) => {
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-sm ${
                            r.rank === 1 ? 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 ring-2 ring-amber-100' : 
                            r.rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 ring-2 ring-slate-100' : 
                            r.rank === 3 ? 'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-900 ring-2 ring-orange-50' : 
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {r.rank}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono text-slate-500 font-medium text-xs bg-slate-50/50">{r.schoolId}</td>
                        <td className="px-6 py-3 max-w-[300px] truncate font-bold text-slate-900" title={r.schoolName}>
                          {r.schoolName}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-700">{r.satCount}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-emerald-700">{r.aCount}</span> 
                          <span className="text-xs text-slate-400 ml-1 font-medium">({r.aPercentage}%)</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-blue-700">{r.bCount}</span> 
                          <span className="text-xs text-slate-400 ml-1 font-medium">({r.bPercentage}%)</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-indigo-700">{r.cCount}</span> 
                          <span className="text-xs text-slate-400 ml-1 font-medium">({r.cPercentage}%)</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-amber-700">{r.sCount}</span> 
                          <span className="text-xs text-slate-400 ml-1 font-medium">({r.sPercentage}%)</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-rose-700">{r.wCount}</span> 
                          <span className="text-xs text-slate-400 ml-1 font-medium">({r.wPercentage}%)</span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400 font-medium">{r.absentCount}</td>
                        <td className="px-6 py-3 text-right font-extrabold text-emerald-700 bg-emerald-50/30 text-base">{r.passCount}</td>
                        <td className="px-6 py-3 text-right bg-emerald-50/60">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-sm border border-emerald-200">
                            {r.passPercentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
