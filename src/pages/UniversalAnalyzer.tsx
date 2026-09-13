import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  parseSpreadsheetClient,
  exportDataClient,
  type UniversalParsedResult,
} from '../lib/universalParser';
import { api } from '../lib/api';
import { DynamicFilterPanel, type DynamicFilterValues } from '../components/DynamicFilterPanel';
import { UniversalDataTable } from '../components/UniversalDataTable';
import { DataVisualizer } from '../components/DataVisualizer';
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  BarChart2,
  Table as TableIcon,
  AlertCircle,
  CloudUpload,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '../components/ui';
import { Link } from 'react-router-dom';

// Demo sample datasets for instant testing
const DEMO_DATASETS = {
  sales: {
    name: 'Sales_Performance_Q1.xlsx',
    data: [
      ['District', 'Category', 'Sales Rep', 'Units Sold', 'Revenue ($)', 'Profit Margin', 'Date', 'Status'],
      ['Colombo', 'Electronics', 'Sunil P.', 120, 48000, '28%', '2025-01-12', 'Active'],
      ['Galle', 'Appliances', 'Kamal S.', 85, 25500, '32%', '2025-01-15', 'Active'],
      ['Kandy', 'Electronics', 'Nimal F.', 140, 56000, '25%', '2025-01-20', 'Active'],
      ['Colombo', 'Furniture', 'Anura D.', 45, 31500, '35%', '2025-01-25', 'Pending'],
      ['Jaffna', 'Appliances', 'Suresh K.', 60, 18000, '22%', '2025-02-01', 'Active'],
      ['Colombo', 'Appliances', 'Sunil P.', 90, 27000, '29%', '2025-02-05', 'Active'],
      ['Galle', 'Electronics', 'Kamal S.', 110, 44000, '27%', '2025-02-12', 'Active'],
      ['Kandy', 'Furniture', 'Nimal F.', 50, 35000, '38%', '2025-02-18', 'Pending'],
      ['Matara', 'Electronics', 'Priyantha M.', 75, 30000, '24%', '2025-02-22', 'Active'],
      ['Galle', 'Furniture', 'Kamal S.', 35, 24500, '36%', '2025-02-28', 'Active'],
      ['Colombo', 'Electronics', 'Sunil P.', 160, 64000, '30%', '2025-03-02', 'Active'],
      ['Jaffna', 'Furniture', 'Suresh K.', 40, 28000, '34%', '2025-03-10', 'Inactive'],
    ],
  },
  students: {
    name: 'Student_Exam_Results_2025.xlsx',
    data: [
      ['Student Name', 'Stream', 'Province', 'Attendance %', 'Math Grade', 'Science Grade', 'English Grade', 'Qualified'],
      ['Dineth Silva', 'Physical Science', 'Western', '92%', 'A', 'A', 'B', 'Yes'],
      ['Kavindi Perera', 'Bio Science', 'Southern', '96%', 'B', 'A', 'A', 'Yes'],
      ['Mohamed Rizwan', 'Technology', 'Western', '88%', 'C', 'B', 'C', 'Yes'],
      ['Tharindu Bandara', 'Commerce', 'Central', '78%', 'B', 'C', 'B', 'Yes'],
      ['Ananya Fernando', 'Physical Science', 'Western', '95%', 'A', 'A', 'A', 'Yes'],
      ['Sajith Wickrama', 'Arts', 'Central', '84%', 'C', 'S', 'B', 'No'],
      ['Chamodi De Silva', 'Bio Science', 'Southern', '91%', 'B', 'B', 'A', 'Yes'],
      ['Nuwan Kumara', 'Technology', 'North Western', '74%', 'S', 'C', 'C', 'No'],
      ['Ishara Madushan', 'Physical Science', 'Western', '98%', 'A', 'A', 'B', 'Yes'],
      ['Fatima Zahra', 'Commerce', 'Eastern', '89%', 'A', 'B', 'A', 'Yes'],
    ],
  },
};

export function UniversalAnalyzer() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<UniversalParsedResult | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<DynamicFilterValues>({});
  const [activeTab, setActiveTab] = useState<'table' | 'visualize'>('table');
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [datasetSaveName, setDatasetSaveName] = useState('');

  // Handle file drop/selection
  const processFileBuffer = useCallback(
    (buffer: ArrayBuffer, fileName: string) => {
      try {
        setIsLoading(true);
        // Public client-side parse
        const result = parseSpreadsheetClient(buffer, undefined, user ? 100000 : 10000);
        setParsedResult(result);
        setActiveFileName(fileName);
        setDatasetSaveName(fileName.replace(/\.(xlsx|xls|csv)$/i, ''));
        setActiveFilters({});
        addToast(`Successfully analyzed "${fileName}" (${result.rowCount.toLocaleString()} rows)`, 'success');
      } catch (err: any) {
        addToast(err.message || 'Failed to parse spreadsheet', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [user, addToast]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          processFileBuffer(evt.target.result as ArrayBuffer, file.name);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Switch sheet
  const handleSheetChange = (sheetName: string) => {
    if (!parsedResult) return;
    try {
      setIsLoading(true);
      // Re-parse with target sheet
      // If we don't have raw buffer stored, just update state
      setParsedResult((prev) => (prev ? { ...prev, activeSheet: sheetName } : null));
      setActiveFilters({});
    } finally {
      setIsLoading(false);
    }
  };

  // Load one-click interactive demo dataset
  const loadDemo = (type: 'sales' | 'students') => {
    try {
      setIsLoading(true);
      const demo = DEMO_DATASETS[type];
      import('xlsx').then((XLSX) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(demo.data);
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        processFileBuffer(buffer, demo.name);
      });
    } catch (err: any) {
      addToast('Failed to load demo dataset', 'error');
      setIsLoading(false);
    }
  };

  // Update dynamic filter value
  const handleFilterChange = (colName: string, value: any) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (value === null || value === undefined || value === '') {
        delete next[colName];
      } else {
        next[colName] = value;
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setActiveFilters({});
  };

  // Filter rows based on all active dynamic filters
  const filteredRows = useMemo(() => {
    if (!parsedResult) return [];
    const filterKeys = Object.keys(activeFilters);
    if (filterKeys.length === 0) return parsedResult.rows;

    return parsedResult.rows.filter((row) => {
      return filterKeys.every((colName) => {
        const filterVal = activeFilters[colName];
        const rowVal = row[colName];

        if (filterVal === null || filterVal === undefined) return true;

        const colMeta = parsedResult.columns.find((c) => c.name === colName);
        if (!colMeta) return true;

        // 1. Category multi-select
        if (colMeta.dataType === 'category') {
          if (Array.isArray(filterVal) && filterVal.length > 0) {
            return filterVal.includes(rowVal);
          }
          return true;
        }

        // 2. Numeric / Percentage range
        if (colMeta.dataType === 'number' || colMeta.dataType === 'percentage') {
          if (typeof filterVal === 'object') {
            const num = typeof rowVal === 'number' ? rowVal : parseFloat(String(rowVal).replace(/[^0-9.-]/g, ''));
            if (isNaN(num)) return false;
            if (filterVal.min !== undefined && num < filterVal.min) return false;
            if (filterVal.max !== undefined && num > filterVal.max) return false;
            return true;
          }
        }

        // 3. Date range
        if (colMeta.dataType === 'date') {
          if (typeof filterVal === 'object') {
            if (!rowVal) return false;
            const rowTime = new Date(rowVal).getTime();
            if (isNaN(rowTime)) return false;

            if (filterVal.startDate) {
              const startTime = new Date(filterVal.startDate).getTime();
              if (rowTime < startTime) return false;
            }
            if (filterVal.endDate) {
              const endTime = new Date(filterVal.endDate).getTime();
              if (rowTime > endTime) return false;
            }
            return true;
          }
        }

        // 4. Boolean toggle
        if (colMeta.dataType === 'boolean') {
          if (filterVal === 'true') {
            return String(rowVal).toLowerCase() === 'true' || String(rowVal).toLowerCase() === 'yes' || rowVal === 1;
          }
          if (filterVal === 'false') {
            return String(rowVal).toLowerCase() === 'false' || String(rowVal).toLowerCase() === 'no' || rowVal === 0;
          }
          return true;
        }

        // 5. Text search
        if (typeof filterVal === 'string' && filterVal.trim() !== '') {
          if (rowVal === null || rowVal === undefined) return false;
          return String(rowVal).toLowerCase().includes(filterVal.toLowerCase().trim());
        }

        return true;
      });
    });
  }, [parsedResult, activeFilters]);

  // Export handlers
  const handleExportExcel = () => {
    if (!filteredRows || filteredRows.length === 0) {
      return addToast('No records to export.', 'error');
    }
    exportDataClient(filteredRows, 'xlsx', `${activeFileName.replace(/\.[^/.]+$/, '')}_filtered`);
    addToast('Excel export initiated.', 'success');
  };

  const handleExportCSV = () => {
    if (!filteredRows || filteredRows.length === 0) {
      return addToast('No records to export.', 'error');
    }
    exportDataClient(filteredRows, 'csv', `${activeFileName.replace(/\.[^/.]+$/, '')}_filtered`);
    addToast('CSV export initiated.', 'success');
  };

  // Save to Cloud (Registered Users)
  const handleSaveToCloud = async () => {
    if (!user) {
      setShowSaveModal(true);
      return;
    }

    if (!parsedResult) return;

    try {
      setIsSavingCloud(true);
      await api.post('/universal/save', {
        name: datasetSaveName || activeFileName,
        originalFileName: activeFileName,
        fileSizeBytes: 1024 * parsedResult.rowCount, // estimate
        rowCount: parsedResult.rowCount,
        columnCount: parsedResult.columnCount,
        sheetNames: parsedResult.sheetNames,
        activeSheet: parsedResult.activeSheet,
        columns: parsedResult.columns,
        summary: parsedResult.summary,
      });

      addToast('Dataset saved to your cloud workspace!', 'success');
      setShowSaveModal(false);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to save dataset', 'error');
    } finally {
      setIsSavingCloud(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col pb-16">
      {/* Top Banner / Workspace Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-20 px-4 py-3 shadow-xs">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Universal Excel Analyzer
                </h1>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold">
                  {user ? 'Cloud Workspace' : 'Free Public Mode'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                {activeFileName ? `Active file: ${activeFileName}` : 'Zero-setup instant spreadsheet intelligence'}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="inline-flex items-center justify-center h-9 px-3.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50 transition-all">
                <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Upload Another File
              </span>
            </label>

            {parsedResult && (
              <Button
                size="sm"
                onClick={() => setShowSaveModal(true)}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-200"
              >
                <CloudUpload className="w-3.5 h-3.5 mr-1.5" />
                Save Dataset
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pt-6 flex-1 flex flex-col gap-6">
        {/* If no file is loaded, show upload dropzone and sample demo datasets */}
        {!parsedResult ? (
          <div className="space-y-8 max-w-4xl mx-auto w-full pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Upload Any Spreadsheet to Begin
              </h2>
              <p className="text-slate-600 text-base max-w-xl mx-auto">
                Drag and drop your Excel (.xlsx, .xls) or CSV file. The platform automatically detects columns, types, and creates dynamic smart filters.
              </p>
            </div>

            {/* Drag and drop upload card */}
            <Card className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-3xl shadow-sm transition-all group overflow-hidden">
              <CardContent className="p-12 sm:p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-10 h-10" />
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Choose a spreadsheet or drag & drop here
                </h3>
                <p className="text-xs text-slate-500 mb-6 max-w-md">
                  Supports <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> files up to {user ? '25MB (Registered)' : '5MB (Public free tier)'}. Zero formula injection, sanitized client-side.
                </p>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center justify-center h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all">
                    Browse File on Computer
                  </span>
                </label>
              </CardContent>
            </Card>

            {/* Try with Demo Datasets */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Or Test Immediately With Sample Data
                </span>
                <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> No file required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => loadDemo('sales')}
                  disabled={isLoading}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-800 block group-hover:text-indigo-600 transition-colors">
                        Sales Performance Dataset
                      </span>
                      <span className="text-xs text-slate-500">
                        Districts, Categories, Revenue, Dates & Margins
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => loadDemo('students')}
                  disabled={isLoading}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-800 block group-hover:text-indigo-600 transition-colors">
                        Student Exam Scores Dataset
                      </span>
                      <span className="text-xs text-slate-500">
                        Streams, Attendance, Letter Grades & Pass Status
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* When file is loaded: Full Workspace */
          <div className="space-y-6">
            {/* Sheet Selector & Summary Metrics Bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              {/* Sheet tabs if multiple */}
              <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                  Sheets:
                </span>
                {parsedResult.sheetNames.map((sheet) => (
                  <button
                    key={sheet}
                    onClick={() => handleSheetChange(sheet)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      parsedResult.activeSheet === sheet
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sheet}
                  </button>
                ))}
              </div>

              {/* Summary Metrics Chips */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <strong>{parsedResult.rowCount.toLocaleString()}</strong> Rows
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <strong>{parsedResult.columnCount}</strong> Columns
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Header Row: #{parsedResult.headerRowIndex + 1}
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Missing Data: <strong>{parsedResult.summary.missingDataPercentage}%</strong>
                </div>
              </div>
            </div>

            {/* Warnings Alert if any */}
            {parsedResult.warnings.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{parsedResult.warnings.join(' ')}</span>
              </div>
            )}

            {/* Tab switch between Table and Visualizer */}
            <div className="flex items-center justify-between border-b border-slate-200">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('table')}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'table'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <TableIcon className="w-4 h-4" />
                  Data Table ({filteredRows.length.toLocaleString()})
                </button>
                <button
                  onClick={() => setActiveTab('visualize')}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'visualize'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  Charts & Visualizations
                </button>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline">
                Dynamic Filters Applied: <strong>{Object.keys(activeFilters).length}</strong>
              </span>
            </div>

            {/* Main Split Layout: Left Filters (w-80) | Right Content */}
            <div className="flex flex-col lg:flex-row items-start gap-6">
              {/* Dynamic Filters Sidebar */}
              <div className="w-full lg:w-80 shrink-0">
                <DynamicFilterPanel
                  columns={parsedResult.columns}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  filteredCount={filteredRows.length}
                  totalCount={parsedResult.rowCount}
                />
              </div>

              {/* Center Content: Table or Visualizer */}
              <div className="flex-1 w-full min-w-0">
                {activeTab === 'table' ? (
                  <UniversalDataTable
                    columns={parsedResult.columns}
                    rows={filteredRows}
                    fileName={activeFileName}
                    onExportExcel={handleExportExcel}
                    onExportCSV={handleExportCSV}
                    isSavingCloud={isSavingCloud}
                    onSaveCloud={() => setShowSaveModal(true)}
                  />
                ) : (
                  <DataVisualizer
                    columns={parsedResult.columns}
                    rows={filteredRows}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save to Cloud Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">Save Dataset</h3>
                  <p className="text-xs text-slate-500">Persist to your private Supabase storage</p>
                </div>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {user ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dataset Name</label>
                  <input
                    type="text"
                    value={datasetSaveName}
                    onChange={(e) => setDatasetSaveName(e.target.value)}
                    placeholder="E.g. Q1 Sales Performance"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Rows to save:</span>
                    <strong>{parsedResult?.rowCount.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Columns detected:</span>
                    <strong>{parsedResult?.columnCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Access permission:</span>
                    <strong className="text-emerald-600">Private (RLS Protected)</strong>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowSaveModal(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveToCloud}
                    disabled={isSavingCloud}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-200"
                  >
                    {isSavingCloud ? 'Saving...' : 'Confirm Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                  <Lock className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                  <strong>Account Required for Cloud Storage</strong>
                  <p className="mt-1">
                    Free public users can analyze and export files instantly without an account. To permanently store datasets, save custom filters, and access dashboards, create a free account.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Link to="/signup">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="w-full rounded-xl h-11">
                      Sign In to Existing Account
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
