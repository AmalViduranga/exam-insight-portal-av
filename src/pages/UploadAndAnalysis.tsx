import { useState } from "react";
import { FileUpload } from "../components/FileUpload";
import { ValidationPanel } from "../components/ValidationPanel";
import { SchoolSelector } from "../components/SchoolSelector";
import { SubjectAnalysis } from "../components/SubjectAnalysis";
import { AllSchoolsReport } from "../components/AllSchoolsReport";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { Button } from "../components/ui";

export function UploadAndAnalysis() {
  const { processedData, setProcessedData, clearAnalysis, isLoadingData } = useAnalysis();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"schools" | "all-schools">("schools");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const handleDataProcessed = (data: any) => {
    setProcessedData(data);
    setErrorMsg(null);
    setSelectedSchoolId(null);
    setActiveTab("schools");
  };

  const handleFileError = (msg: string) => {
    setErrorMsg(msg);
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-bold text-slate-900">Loading Session</h3>
        <p className="text-slate-500 mt-1">Retrieving your active analysis data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {processedData && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Results</h2>
            <p className="text-slate-500">Review validation metrics and explore school reports.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => clearAnalysis()}
            className="text-sm font-semibold bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Upload New File
          </Button>
        </div>
      )}

      {!processedData ? (
        <>
          {errorMsg && (
            <div className="max-w-5xl mx-auto mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <h4 className="text-sm font-bold">Upload Error</h4>
                <p className="text-sm mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
          <FileUpload onDataProcessed={handleDataProcessed} onFileError={handleFileError} />
        </>
      ) : (
        <div className="space-y-8">
          <ValidationPanel data={processedData} />
          
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100/80 p-1.5 rounded-xl inline-flex border border-slate-200 shadow-inner">
              <button
                onClick={() => { setActiveTab("schools"); setSelectedSchoolId(null); }}
                className={`px-8 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "schools" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                Single School Analysis
              </button>
              <button
                onClick={() => { setActiveTab("all-schools"); setSelectedSchoolId(null); }}
                className={`px-8 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "all-schools" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                All Schools Report
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8">
              {activeTab === "schools" && !selectedSchoolId && (
                <SchoolSelector data={processedData} onSelect={setSelectedSchoolId} />
              )}
              
              {activeTab === "schools" && selectedSchoolId && (
                <SubjectAnalysis
                  data={processedData}
                  schoolId={selectedSchoolId}
                  onBack={() => setSelectedSchoolId(null)}
                />
              )}

              {activeTab === "all-schools" && (
                <AllSchoolsReport data={processedData} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
