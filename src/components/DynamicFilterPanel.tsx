import { useState, useMemo } from 'react';
import type { ColumnMetadata } from '../lib/universalParser';
import {
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Hash,
  Calendar,
  ToggleLeft,
  Type,
  Percent,
  Layers,
  X,
  Sliders,
} from 'lucide-react';
import { Button } from './ui';

export interface DynamicFilterValues {
  [colName: string]: any;
}

interface DynamicFilterPanelProps {
  columns: ColumnMetadata[];
  activeFilters: DynamicFilterValues;
  onFilterChange: (colName: string, value: any) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export function DynamicFilterPanel({
  columns,
  activeFilters,
  onFilterChange,
  onResetFilters,
  filteredCount,
  totalCount,
}: DynamicFilterPanelProps) {
  const [filterSearch, setFilterSearch] = useState('');
  const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});

  const toggleExpand = (colName: string) => {
    setExpandedCols((prev) => ({
      ...prev,
      [colName]: prev[colName] === undefined ? false : !prev[colName],
    }));
  };

  const visibleColumns = useMemo(() => {
    if (!filterSearch.trim()) return columns;
    const q = filterSearch.toLowerCase();
    return columns.filter(
      (col) =>
        col.name.toLowerCase().includes(q) ||
        col.dataType.toLowerCase().includes(q)
    );
  }, [columns, filterSearch]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (const key of Object.keys(activeFilters)) {
      const val = activeFilters[key];
      if (val === null || val === undefined || val === '') continue;
      if (Array.isArray(val) && val.length > 0) count++;
      else if (typeof val === 'object') {
        if (val.min !== undefined || val.max !== undefined || val.startDate || val.endDate) {
          count++;
        }
      } else if (typeof val === 'string' && val.trim() !== '') {
        count++;
      }
    }
    return count;
  }, [activeFilters]);

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <Hash className="w-3.5 h-3.5 text-blue-500" />;
      case 'percentage':
        return <Percent className="w-3.5 h-3.5 text-emerald-500" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-purple-500" />;
      case 'category':
        return <Layers className="w-3.5 h-3.5 text-amber-500" />;
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5 text-teal-500" />;
      default:
        return <Type className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <aside className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Smart Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} rows
            </span>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 h-7 font-semibold"
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
        )}
      </div>

      {/* Column Search inside filters */}
      {columns.length > 5 && (
        <div className="p-3 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find a filter..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {filterSearch && (
              <button
                onClick={() => setFilterSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter controls list */}
      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[calc(100vh-280px)] p-1">
        {visibleColumns.map((col) => {
          const isExpanded = expandedCols[col.name] !== false;
          const currentFilter = activeFilters[col.name];
          const hasFilter =
            currentFilter !== undefined &&
            currentFilter !== null &&
            currentFilter !== '' &&
            (!Array.isArray(currentFilter) || currentFilter.length > 0);

          return (
            <div key={col.id} className="py-2 px-3">
              <button
                type="button"
                onClick={() => toggleExpand(col.name)}
                className="w-full flex items-center justify-between py-1 text-left group"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <div className="shrink-0">{getDataTypeIcon(col.dataType)}</div>
                  <span className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                    {col.name}
                  </span>
                  {hasFilter && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {col.dataType}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="pt-2 pb-1 space-y-2">
                  {col.dataType === 'category' && (
                    <div className="space-y-1.5">
                      <div className="max-h-40 overflow-y-auto pr-1 space-y-1 text-xs">
                        {col.distinctValues.slice(0, 30).map((dv, idx) => {
                          const isSelected = Array.isArray(currentFilter)
                            ? currentFilter.includes(dv.value)
                            : false;
                          return (
                            <label
                              key={idx}
                              className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-indigo-50/80 text-indigo-900 font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = Array.isArray(currentFilter) ? [...currentFilter] : [];
                                    if (e.target.checked) {
                                      current.push(dv.value);
                                    } else {
                                      const pos = current.indexOf(dv.value);
                                      if (pos > -1) current.splice(pos, 1);
                                    }
                                    onFilterChange(col.name, current.length > 0 ? current : null);
                                  }}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="truncate">{String(dv.value)}</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                                {dv.count}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {col.distinctValues.length > 30 && (
                        <span className="text-[10px] text-slate-400 block italic">
                          Showing top 30 of {col.cardinality} categories
                        </span>
                      )}
                    </div>
                  )}

                  {(col.dataType === 'number' || col.dataType === 'percentage') && (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Min {col.minValue !== null && `(${col.minValue})`}
                          </label>
                          <input
                            type="number"
                            placeholder="Min"
                            value={currentFilter?.min ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : Number(e.target.value);
                              onFilterChange(col.name, {
                                ...currentFilter,
                                min: val,
                              });
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Max {col.maxValue !== null && `(${col.maxValue})`}
                          </label>
                          <input
                            type="number"
                            placeholder="Max"
                            value={currentFilter?.max ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : Number(e.target.value);
                              onFilterChange(col.name, {
                                ...currentFilter,
                                max: val,
                              });
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {col.avgValue !== null && (
                        <div className="text-[10px] text-slate-500 flex justify-between pt-0.5">
                          <span>Average:</span>
                          <span className="font-semibold text-slate-700">
                            {col.avgValue}
                            {col.dataType === 'percentage' ? '%' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {col.dataType === 'date' && (
                    <div className="space-y-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          From
                        </label>
                        <input
                          type="date"
                          value={currentFilter?.startDate || ''}
                          onChange={(e) => {
                            onFilterChange(col.name, {
                              ...currentFilter,
                              startDate: e.target.value || undefined,
                            });
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          To
                        </label>
                        <input
                          type="date"
                          value={currentFilter?.endDate || ''}
                          onChange={(e) => {
                            onFilterChange(col.name, {
                              ...currentFilter,
                              endDate: e.target.value || undefined,
                            });
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {col.dataType === 'boolean' && (
                    <div className="flex gap-1">
                      {['All', 'Yes / True', 'No / False'].map((opt) => {
                        const isSelected =
                          (opt === 'All' && !currentFilter) ||
                          (opt === 'Yes / True' && currentFilter === 'true') ||
                          (opt === 'No / False' && currentFilter === 'false');
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              if (opt === 'All') onFilterChange(col.name, null);
                              else if (opt === 'Yes / True') onFilterChange(col.name, 'true');
                              else onFilterChange(col.name, 'false');
                            }}
                            className={`flex-1 py-1 text-[11px] rounded font-semibold border transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {col.dataType === 'text' && (
                    <div className="relative">
                      <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={`Search in ${col.name}...`}
                        value={typeof currentFilter === 'string' ? currentFilter : ''}
                        onChange={(e) => {
                          onFilterChange(col.name, e.target.value || null);
                        }}
                        className="w-full pl-7 pr-2 py-1 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
