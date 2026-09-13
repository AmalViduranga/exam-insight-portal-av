import { useState, useMemo } from 'react';
import type { ColumnMetadata } from '../lib/universalParser';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  FileSpreadsheet,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Table as TableIcon,
} from 'lucide-react';
import { Button } from './ui';

interface UniversalDataTableProps {
  columns: ColumnMetadata[];
  rows: Record<string, any>[];
  fileName?: string;
  onExportExcel: () => void;
  onExportCSV: () => void;
  isSavingCloud?: boolean;
  onSaveCloud?: () => void;
}

export function UniversalDataTable({
  columns,
  rows,
  fileName: _fileName,
  onExportExcel,
  onExportCSV,
  isSavingCloud,
  onSaveCloud,
}: UniversalDataTableProps) {
  // Global search input
  const [searchQuery, setSearchQuery] = useState('');

  // Column visibility state (default: all visible)
  const [visibleColNames, setVisibleColNames] = useState<string[]>(() =>
    columns.map((c) => c.name)
  );
  const [isColVisibilityOpen, setIsColVisibilityOpen] = useState(false);

  // Sorting state
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Handle column sort toggle
  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortCol(null); // remove sort
      }
    } else {
      setSortCol(colName);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // 1. Filter rows by global search query
  const searchedRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((row) => {
      return visibleColNames.some((colName) => {
        const val = row[colName];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [rows, searchQuery, visibleColNames]);

  // 2. Sort filtered rows
  const sortedRows = useMemo(() => {
    if (!sortCol) return searchedRows;

    const colMeta = columns.find((c) => c.name === sortCol);
    const isNumeric = colMeta?.dataType === 'number' || colMeta?.dataType === 'percentage';

    return [...searchedRows].sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (isNumeric) {
        const numA = typeof valA === 'number' ? valA : parseFloat(String(valA).replace(/[^0-9.-]/g, ''));
        const numB = typeof valB === 'number' ? valB : parseFloat(String(valB).replace(/[^0-9.-]/g, ''));
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      const cmp = strA.localeCompare(strB);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [searchedRows, sortCol, sortDirection, columns]);

  // 3. Paginate sorted rows
  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, safePage, pageSize]);

  // Toggle single column visibility
  const toggleColumnVisibility = (colName: string) => {
    setVisibleColNames((prev) => {
      if (prev.includes(colName)) {
        if (prev.length === 1) return prev; // Keep at least one column
        return prev.filter((name) => name !== colName);
      }
      return [...prev, colName];
    });
  };

  const showAllColumns = () => setVisibleColNames(columns.map((c) => c.name));
  const hideAllColumns = () => {
    if (columns.length > 0) setVisibleColNames([columns[0].name]);
  };

  // Active columns metadata
  const displayedCols = useMemo(() => {
    return columns.filter((c) => visibleColNames.includes(c.name));
  }, [columns, visibleColNames]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Top Action Bar */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Global Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search across all columns..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls: Column Visibility + Exports + Cloud Save */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Column Visibility Popover Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsColVisibilityOpen(!isColVisibilityOpen)}
              className="h-9 px-3 rounded-xl border-slate-200 bg-white text-slate-700 font-semibold shadow-xs hover:bg-slate-50"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Columns ({displayedCols.length}/{columns.length})
            </Button>

            {/* Dropdown Menu */}
            {isColVisibilityOpen && (
              <div className="absolute right-0 top-11 z-30 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Show / Hide Columns</span>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      onClick={showAllColumns}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Show All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={hideAllColumns}
                      className="text-slate-500 hover:underline font-semibold"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {columns.map((col) => {
                    const isChecked = visibleColNames.includes(col.name);
                    return (
                      <label
                        key={col.id}
                        className="flex items-center justify-between p-1 rounded hover:bg-slate-50 cursor-pointer text-xs text-slate-700"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleColumnVisibility(col.name)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="truncate">{col.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">
                          {col.dataType}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="h-9 px-3 rounded-xl border-slate-200 bg-white text-slate-700 font-semibold shadow-xs hover:bg-slate-50"
            title="Download sanitized CSV"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            CSV
          </Button>

          {/* Export Excel */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            className="h-9 px-3 rounded-xl border-emerald-200 bg-emerald-50/50 text-emerald-700 font-semibold shadow-xs hover:bg-emerald-50"
            title="Download formatted Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Excel
          </Button>

          {/* Save to Cloud (Registered / Upsell) */}
          {onSaveCloud && (
            <Button
              size="sm"
              onClick={onSaveCloud}
              disabled={isSavingCloud}
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs shadow-indigo-200"
            >
              {isSavingCloud ? 'Saving...' : 'Save to Cloud'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <div className="relative overflow-x-auto min-h-[300px]">
        {sortedRows.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <TableIcon className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">No Matching Data Rows</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              None of the records match your current search query or active dynamic filters. Try adjusting or clearing your filters.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            {/* Sticky Table Header */}
            <thead className="bg-slate-50 border-b border-slate-200/80 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-12 text-center">
                  #
                </th>
                {displayedCols.map((col) => {
                  const isSorted = sortCol === col.name;
                  return (
                    <th
                      key={col.id}
                      onClick={() => handleSort(col.name)}
                      className="py-3 px-4 text-xs font-bold text-slate-700 select-none cursor-pointer hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{col.name}</span>
                        <div className="text-slate-400 shrink-0">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedRows.map((row, rowIdx) => {
                const globalRowNumber = (safePage - 1) * pageSize + rowIdx + 1;
                return (
                  <tr
                    key={rowIdx}
                    className="hover:bg-indigo-50/30 transition-colors odd:bg-white even:bg-slate-50/20"
                  >
                    <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-400">
                      {globalRowNumber}
                    </td>
                    {displayedCols.map((col) => {
                      const val = row[col.name];
                      const isNull = val === null || val === undefined || val === '';

                      return (
                        <td key={col.id} className="py-2.5 px-4 truncate max-w-xs">
                          {isNull ? (
                            <span className="text-slate-300 italic font-mono">-</span>
                          ) : col.dataType === 'percentage' ? (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {String(val).endsWith('%') ? val : `${val}%`}
                            </span>
                          ) : col.dataType === 'boolean' ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                String(val).toLowerCase() === 'true' ||
                                String(val).toLowerCase() === 'yes' ||
                                val === 1
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {String(val)}
                            </span>
                          ) : col.dataType === 'category' ? (
                            <span className="font-medium text-slate-800 bg-slate-100/80 px-2 py-0.5 rounded">
                              {String(val)}
                            </span>
                          ) : col.dataType === 'number' ? (
                            <span className="font-mono text-slate-800">
                              {typeof val === 'number' ? val.toLocaleString() : String(val)}
                            </span>
                          ) : (
                            <span>{String(val)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Row count info */}
        <div className="text-xs text-slate-500 font-medium">
          Showing{' '}
          <strong className="text-slate-800">
            {totalRows === 0 ? 0 : (safePage - 1) * pageSize + 1}
          </strong>{' '}
          to{' '}
          <strong className="text-slate-800">
            {Math.min(safePage * pageSize, totalRows)}
          </strong>{' '}
          of <strong className="text-slate-800">{totalRows.toLocaleString()}</strong> records
          {searchQuery && ' (filtered from search)'}
        </div>

        {/* Page navigation and page size selector */}
        <div className="flex items-center gap-3">
          {/* Page size dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(1)}
              className="h-8 w-8 p-0 rounded-lg"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0 rounded-lg"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            <span className="text-xs font-semibold text-slate-700 px-2">
              {safePage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 p-0 rounded-lg"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="h-8 w-8 p-0 rounded-lg"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
