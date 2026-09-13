import { UploadAndAnalysis } from './UploadAndAnalysis';
import { FileSpreadsheet } from 'lucide-react';
import { Badge } from '../components/ui';

export function PublicExamAnalyzer() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="container mx-auto px-4 max-w-6xl space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl text-slate-900 tracking-tight">
                  Ministry Exam Result Analysis Suite
                </h1>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-bold">
                  Specialized Tool
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                School-wise and subject-wise exam performance grading, rankings, and consolidated reporting.
              </p>
            </div>
          </div>
        </div>

        {/* Upload and Analysis Workspace */}
        <UploadAndAnalysis />
      </div>
    </div>
  );
}
