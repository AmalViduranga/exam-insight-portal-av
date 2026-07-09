import { useCallback, useState } from "react";
import { UploadCloud, Loader2, ShieldCheck, Database, BarChart3, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";
import { Card, CardContent } from "./ui";

interface FileUploadProps {
  onDataProcessed: (data: any) => void;
  onFileError: (msg: string) => void;
}

export function FileUpload({ onDataProcessed, onFileError }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sheetName', 'Summary');

      try {
        const response = await api.post('/analysis/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data) {
          onDataProcessed(response.data);
        }
      } catch (err: any) {
        onFileError(err.response?.data?.message || err.message || "An error occurred while uploading the file.");
      } finally {
        setIsUploading(false);
      }
    },
    [onDataProcessed, onFileError]
  );

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center md:text-left mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">Upload Exam Results</h2>
        <p className="text-lg text-slate-600 max-w-2xl">Upload Excel result sheets to analyze school-wise and subject-wise performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <Card 
            className={`w-full shadow-sm border-2 transition-all duration-200 rounded-2xl overflow-hidden ${
              dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
            }`}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
          >
            <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center space-y-6 text-center">
              <div className={`p-5 rounded-full transition-colors ${dragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-500'}`}>
                {isUploading ? (
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                ) : (
                  <UploadCloud className={`w-12 h-12 ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isUploading ? "Uploading & Analyzing..." : "Drag & Drop Excel File"}
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                  {isUploading ? "Please wait while we process your file securely." : "Drop your exam result sheet here, or click to browse files from your computer."}
                </p>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">.XLSX</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">.XLS</span>
                </div>
              </div>

              <label className={`cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm inline-flex items-center justify-center rounded-xl text-sm font-semibold h-12 px-8 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                Select Excel File
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={onFileChange}
                  disabled={isUploading}
                />
              </label>
              
            </CardContent>
            
            <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
              <p className="text-sm text-slate-500 flex items-center justify-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                File is processed securely on the server
              </p>
            </div>
          </Card>
        </div>

        {/* Side Helper Card */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border-slate-200 bg-white h-full rounded-2xl">
            <CardContent className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-6">What happens after upload?</h3>
              
              <div className="space-y-6 flex-1">
                {[
                  { icon: ShieldCheck, title: "1. Secure Upload", desc: "File is securely transferred and temporarily stored." },
                  { icon: Database, title: "2. Data Parsing", desc: "Our engine maps rows to structured exam formats." },
                  { icon: CheckCircle2, title: "3. Detection", desc: "Schools and subject attempts are accurately detected." },
                  { icon: BarChart3, title: "4. Report Ready", desc: "Interactive reports and rankings are generated." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <step.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{step.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
