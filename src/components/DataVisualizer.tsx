import { useState, useMemo } from 'react';
import type { ColumnMetadata } from '../lib/universalParser';
import { BarChart3, TrendingUp, HelpCircle } from 'lucide-react';
import { Card, CardContent } from './ui';

interface DataVisualizerProps {
  columns: ColumnMetadata[];
  rows: Record<string, any>[];
}

export function DataVisualizer({ columns, rows }: DataVisualizerProps) {
  // Categorical columns available for distribution charts
  const categoryCols = useMemo(() => {
    return columns.filter((c) => c.dataType === 'category' || c.dataType === 'boolean');
  }, [columns]);

  // Numeric columns available for metrics & histograms
  const numericCols = useMemo(() => {
    return columns.filter((c) => c.dataType === 'number' || c.dataType === 'percentage');
  }, [columns]);

  // Selected column for bar chart
  const [selectedCatCol, setSelectedCatCol] = useState<string>(() => {
    return categoryCols[0]?.name || '';
  });

  // Selected column for numeric breakdown
  const [selectedNumCol, setSelectedNumCol] = useState<string>(() => {
    return numericCols[0]?.name || '';
  });

  // Calculate live frequency distribution for the selected categorical column based on current filtered rows
  const categoryDistribution = useMemo(() => {
    if (!selectedCatCol || rows.length === 0) return [];

    const counts = new Map<any, number>();
    for (const r of rows) {
      const val = r[selectedCatCol];
      const key = val === null || val === undefined || val === '' ? '(Blank)' : String(val);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / rows.length) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // top 10 categories
  }, [selectedCatCol, rows]);

  // Calculate live numeric summary stats for the selected numeric column based on current filtered rows
  const numericSummary = useMemo(() => {
    if (!selectedNumCol || rows.length === 0) return null;

    const values: number[] = [];
    let sum = 0;

    for (const r of rows) {
      const val = r[selectedNumCol];
      if (val === null || val === undefined || val === '') continue;
      const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) {
        values.push(num);
        sum += num;
      }
    }

    if (values.length === 0) return null;

    values.sort((a, b) => a - b);
    const min = values[0];
    const max = values[values.length - 1];
    const avg = Math.round((sum / values.length) * 100) / 100;
    const median =
      values.length % 2 === 0
        ? Math.round(((values[values.length / 2 - 1] + values[values.length / 2]) / 2) * 100) / 100
        : values[Math.floor(values.length / 2)];

    return {
      count: values.length,
      nulls: rows.length - values.length,
      sum: Math.round(sum * 100) / 100,
      min,
      max,
      avg,
      median,
    };
  }, [selectedNumCol, rows]);

  const maxCount = categoryDistribution[0]?.count || 1;

  if (categoryCols.length === 0 && numericCols.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No chartable columns detected in this sheet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Categorical Distribution Bar Chart */}
      {categoryCols.length > 0 && (
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Category Breakdown</h3>
                  <p className="text-xs text-slate-500">Distribution across active records</p>
                </div>
              </div>

              {/* Column selector */}
              <select
                value={selectedCatCol}
                onChange={(e) => setSelectedCatCol(e.target.value)}
                className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500 max-w-[180px]"
              >
                {categoryCols.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Horizontal Bar Chart visualization */}
            <div className="space-y-2.5 pt-1">
              {categoryDistribution.map((item, idx) => {
                const barWidth = Math.max(4, Math.round((item.count / maxCount) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={item.label}>
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                        <span>{item.count.toLocaleString()}</span>
                        <span className="text-slate-400">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Numeric Metrics Summary Cards */}
      {numericCols.length > 0 && (
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Numeric Summary Statistics</h3>
                  <p className="text-xs text-slate-500">Key metrics for selected numeric field</p>
                </div>
              </div>

              {/* Column selector */}
              <select
                value={selectedNumCol}
                onChange={(e) => setSelectedNumCol(e.target.value)}
                className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-emerald-500 max-w-[180px]"
              >
                {numericCols.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {numericSummary ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Average
                  </span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {numericSummary.avg.toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Median
                  </span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {numericSummary.median.toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Total Sum
                  </span>
                  <span className="text-lg font-bold text-indigo-600 font-mono truncate block" title={String(numericSummary.sum)}>
                    {numericSummary.sum.toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Minimum
                  </span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {numericSummary.min.toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Maximum
                  </span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {numericSummary.max.toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Filled Count
                  </span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {numericSummary.count.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No numeric values found in the selected column for current filtered records.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
