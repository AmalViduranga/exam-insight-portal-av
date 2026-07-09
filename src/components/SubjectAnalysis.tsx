import { useState } from "react";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from "./ui";
import { ArrowLeft, Loader2, BarChart2 } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

interface SubjectAnalysisProps {
  data: any;
  schoolId: string;
  onBack: () => void;
}

const COMMON_SUBJECTS = ["60", "63", "81", "84", "85", "88", "89"];

export function SubjectAnalysis({ data, schoolId, onBack }: SubjectAnalysisProps) {
  const [subjectInput, setSubjectInput] = useState("");
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleCalculate = async (sub: string) => {
    setSubjectInput(sub);
    if (!sub) {
      setStats(null);
      return;
    }

    setLoading(true);
    setStats(null);

    try {
      const res = await api.post(`/analysis/jobs/${data.jobId}/school-stats`, {
        schoolId,
        subjectNo: sub
      });
      setStats(res.data);
      addToast(`Analyzed Subject ${sub}`, "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Error calculating stats', "error");
    } finally {
      setLoading(false);
    }
  };

  const school = data.metrics?.schools[schoolId] || data.schools?.[schoolId];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 bg-slate-50 p-4 sm:px-6 rounded-2xl shadow-sm border border-slate-200">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-white hover:bg-slate-50 text-slate-700 rounded-xl h-10 px-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Schools
        </Button>
        <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2"></div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
            {school?.name}
          </h2>
          <span className="text-sm font-medium text-slate-500 font-mono flex items-center gap-2">
            School ID: <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{schoolId}</span>
          </span>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Analyze Specific Subject</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Input
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              placeholder="Enter subject code (e.g. 60)"
              className="max-w-[300px] h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
            />
            <Button onClick={() => handleCalculate(subjectInput)} disabled={loading} className="px-8 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-sm">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <BarChart2 className="w-5 h-5 mr-2" />}
              {loading ? 'Analyzing...' : 'Generate Stats'}
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

      {stats && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-xl font-bold text-slate-900">Performance Summary</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard title="Applied / Registered" value={stats.totalDid} />
            <StatCard title="Actually Sat" value={stats.satCount} />
            <StatCard title="Absent Count" value={stats.absentCount} />
            <StatCard title="Absent Rate" value={`${stats.absentPercentage}%`} />
            <StatCard title="Passed" value={stats.passCount} className="bg-emerald-50 border-emerald-200 text-emerald-800" />
            <StatCard title="Pass Rate" value={`${stats.passPercentage}%`} className="bg-emerald-100 border-emerald-300 text-emerald-900" />
            <StatCard title="Failed (W)" value={stats.failCount} className="bg-rose-50 border-rose-200 text-rose-800" />
            <StatCard title="Fail Rate" value={`${stats.wPercentage}%`} className="bg-rose-100 border-rose-300 text-rose-900" />
          </div>

          <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden mt-8">
            <CardHeader className="bg-slate-50/80 border-b border-slate-200 pb-5 pt-6 px-6 md:px-8 flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                <BarChart2 className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">Grade Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 md:px-8 py-4 w-1/3">Grade</th>
                    <th className="px-6 md:px-8 py-4 text-right w-1/3">Student Count</th>
                    <th className="px-6 md:px-8 py-4 text-right w-1/3">Percentage (of Sat)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <GradeRow grade="A" count={stats.aCount} percentage={stats.aPercentage} colorClass="text-emerald-700 bg-emerald-50/40" label="Distinction" />
                  <GradeRow grade="B" count={stats.bCount} percentage={stats.bPercentage} colorClass="text-blue-700 bg-blue-50/40" label="Very Good Pass" />
                  <GradeRow grade="C" count={stats.cCount} percentage={stats.cPercentage} colorClass="text-indigo-700 bg-indigo-50/40" label="Credit Pass" />
                  <GradeRow grade="S" count={stats.sCount} percentage={stats.sPercentage} colorClass="text-amber-700 bg-amber-50/40" label="Simple Pass" />
                  <GradeRow grade="W" count={stats.wCount} percentage={stats.wPercentage} colorClass="text-rose-700 bg-rose-50/40" label="Weak / Fail" />
                  <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                    <td className="px-6 md:px-8 py-5 font-bold text-slate-900 text-base">Total Sat (Present)</td>
                    <td className="px-6 md:px-8 py-5 text-right font-extrabold text-slate-900 text-lg">{stats.satCount}</td>
                    <td className="px-6 md:px-8 py-5 text-right font-bold text-slate-500 text-base">100%</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, className }: { title: string, value: string | number, className?: string }) {
  return (
    <div className={`p-6 rounded-2xl border bg-white shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-0.5 ${className || 'border-slate-200 text-slate-900'}`}>
      <span className="text-sm font-bold opacity-70 mb-2">{title}</span>
      <span className="text-3xl md:text-4xl font-extrabold tracking-tight">{value}</span>
    </div>
  );
}

function GradeRow({ grade, count, percentage, colorClass, label }: { grade: string, count: number, percentage: string, colorClass?: string, label: string }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className={`px-6 md:px-8 py-4 ${colorClass || ''}`}>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-current font-extrabold text-lg opacity-90">{grade}</span>
          <span className="font-semibold opacity-80 hidden sm:inline-block">{label}</span>
        </div>
      </td>
      <td className="px-6 md:px-8 py-4 text-right text-lg font-bold text-slate-800">{count}</td>
      <td className="px-6 md:px-8 py-4 text-right">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200">
          {percentage}%
        </span>
      </td>
    </tr>
  );
}
