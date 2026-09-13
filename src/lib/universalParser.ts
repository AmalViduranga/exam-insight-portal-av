import * as XLSX from 'xlsx';

export type InferredDataType = 'text' | 'number' | 'date' | 'percentage' | 'category' | 'boolean';

export interface ColumnMetadata {
  id: string;
  name: string;
  dataType: InferredDataType;
  cardinality: number;
  minValue?: string | number | null;
  maxValue?: string | number | null;
  avgValue?: number | null;
  distinctValues: { value: any; count: number }[];
  nullCount: number;
  sampleValues: any[];
  orderIndex: number;
}

export interface UniversalParsedResult {
  sheetNames: string[];
  activeSheet: string;
  headerRowIndex: number;
  rowCount: number;
  columnCount: number;
  columns: ColumnMetadata[];
  rows: Record<string, any>[];
  summary: {
    totalRows: number;
    totalColumns: number;
    columnTypesCount: Record<InferredDataType, number>;
    missingDataPercentage: number;
  };
  warnings: string[];
}

const DANGEROUS_FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

export function sanitizeCellValue(val: any): any {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.length === 0) return '';
  if (DANGEROUS_FORMULA_PREFIXES.includes(str.charAt(0))) {
    return `'${str}`;
  }
  return val;
}

export function sanitizeDataRows(rows: any[]): any[] {
  return rows.map((row) => {
    if (Array.isArray(row)) {
      return row.map(sanitizeCellValue);
    } else if (typeof row === 'object' && row !== null) {
      const cleanObj: Record<string, any> = {};
      for (const key of Object.keys(row)) {
        cleanObj[key] = sanitizeCellValue(row[key]);
      }
      return cleanObj;
    }
    return sanitizeCellValue(row);
  });
}

function isDateString(str: string): boolean {
  if (!str || str.length < 6 || str.length > 35) return false;
  const trimmed = str.trim();

  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(trimmed) || /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(trimmed)) {
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      const year = new Date(parsed).getFullYear();
      return year >= 1900 && year <= 2100;
    }
  }

  if (/[A-Za-z]{3,9}/.test(trimmed)) {
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      const year = new Date(parsed).getFullYear();
      return year >= 1900 && year <= 2100;
    }
  }

  return false;
}

function isPercentageValue(val: any, headerName: string): boolean {
  if (typeof val === 'string') {
    return /^-?\d+(\.\d+)?%$/.test(val.trim());
  }
  if (typeof val === 'number' && val >= 0 && val <= 1) {
    const lowerH = headerName.toLowerCase();
    return lowerH.includes('%') || lowerH.includes('percent') || lowerH.includes('rate') || lowerH.includes('ratio');
  }
  return false;
}

function isBooleanValue(val: any): boolean {
  if (typeof val === 'boolean') return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return ['true', 'false', 'yes', 'no', 'y', 'n', 'active', 'inactive'].includes(s);
  }
  return false;
}

function tryParseNumber(val: any): number | null {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val !== 'string') return null;

  const clean = val.trim().replace(/^[$€£¥Rs.\s]+/, '').replace(/,/g, '');
  if (clean === '') return null;

  if (clean.endsWith('%')) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? null : num / 100;
  }

  const num = Number(clean);
  return isNaN(num) ? null : num;
}

function detectHeaderRowIndex(rawRows: any[][]): number {
  if (!rawRows || rawRows.length === 0) return 0;

  let bestIndex = 0;
  let highestScore = -1;
  const maxScanRows = Math.min(30, rawRows.length);

  for (let r = 0; r < maxScanRows; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const nonNullCells = row.filter((c) => c !== null && c !== undefined && String(c).trim() !== '');
    if (nonNullCells.length === 0) continue;

    const density = nonNullCells.length / row.length;
    const stringCells = nonNullCells.filter((c) => typeof c === 'string' && isNaN(Number(c)));
    const stringRatio = stringCells.length / nonNullCells.length;
    const uniqueValues = new Set(nonNullCells.map((c) => String(c).trim().toLowerCase()));
    const uniqueness = uniqueValues.size / nonNullCells.length;

    let lookaheadBonus = 0;
    if (r + 1 < rawRows.length) {
      const nextRow = rawRows[r + 1];
      const nextNonNull = (nextRow || []).filter((c) => c !== null && c !== undefined && String(c).trim() !== '');
      if (nextNonNull.length >= nonNullCells.length * 0.7) {
        lookaheadBonus = 0.5;
      }
    }

    const score = (density * 2) + (stringRatio * 3) + (uniqueness * 2) + lookaheadBonus;
    if (score > highestScore) {
      highestScore = score;
      bestIndex = r;
    }
  }

  return bestIndex;
}

/**
 * Universal client-side spreadsheet parser
 */
export function parseSpreadsheetClient(
  data: ArrayBuffer | Uint8Array,
  sheetName?: string,
  maxRows = 10000
): UniversalParsedResult {
  const warnings: string[] = [];
  const workbook = XLSX.read(data, {
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: false,
  });

  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) {
    throw new Error('No sheets found in the uploaded workbook.');
  }

  const activeSheet = sheetName && sheetNames.includes(sheetName) ? sheetName : sheetNames[0];
  const worksheet = workbook.Sheets[activeSheet];

  if (!worksheet) {
    throw new Error(`Sheet "${activeSheet}" could not be loaded.`);
  }

  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
    blankrows: true,
  });

  if (rawRows.length === 0) {
    throw new Error(`The sheet "${activeSheet}" is empty.`);
  }

  const headerRowIndex = detectHeaderRowIndex(rawRows);
  const rawHeaderRow = rawRows[headerRowIndex] || [];

  const headerCounts: Record<string, number> = {};
  const validColIndices: number[] = [];
  const colNames: string[] = [];

  let maxCols = rawHeaderRow.length;
  for (let i = headerRowIndex; i < Math.min(headerRowIndex + 50, rawRows.length); i++) {
    if (rawRows[i] && rawRows[i].length > maxCols) {
      maxCols = rawRows[i].length;
    }
  }

  for (let c = 0; c < maxCols; c++) {
    let rawColName = rawHeaderRow[c] !== null && rawHeaderRow[c] !== undefined ? String(rawHeaderRow[c]).trim() : '';

    let hasAnyData = rawColName.length > 0;
    if (!hasAnyData) {
      for (let r = headerRowIndex + 1; r < Math.min(headerRowIndex + 100, rawRows.length); r++) {
        if (rawRows[r] && rawRows[r][c] !== null && rawRows[r][c] !== undefined && String(rawRows[r][c]).trim() !== '') {
          hasAnyData = true;
          break;
        }
      }
    }

    if (!hasAnyData) continue;

    if (!rawColName) {
      rawColName = `Column_${c + 1}`;
    }

    const lowerName = rawColName.toLowerCase();
    if (headerCounts[lowerName] !== undefined) {
      headerCounts[lowerName]++;
      rawColName = `${rawColName}_${headerCounts[lowerName]}`;
    } else {
      headerCounts[lowerName] = 1;
    }

    validColIndices.push(c);
    colNames.push(rawColName);
  }

  if (colNames.length === 0) {
    throw new Error('No valid columns could be extracted from this spreadsheet.');
  }

  const rows: Record<string, any>[] = [];
  const totalAvailableRows = rawRows.length - (headerRowIndex + 1);

  if (totalAvailableRows > maxRows) {
    warnings.push(`Dataset exceeds processing limit of ${maxRows.toLocaleString()} rows. Showing first ${maxRows.toLocaleString()} rows.`);
  }

  const endRowIndex = Math.min(rawRows.length, headerRowIndex + 1 + maxRows);

  for (let r = headerRowIndex + 1; r < endRowIndex; r++) {
    const rawRow = rawRows[r];
    if (!rawRow) continue;

    const isRowEmpty = validColIndices.every((c) => rawRow[c] === null || rawRow[c] === undefined || String(rawRow[c]).trim() === '');
    if (isRowEmpty) continue;

    const rowObj: Record<string, any> = {};
    for (let i = 0; i < validColIndices.length; i++) {
      const colIdx = validColIndices[i];
      const colName = colNames[i];
      const val = rawRow[colIdx];

      if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        rowObj[colName] = null;
      } else if (val instanceof Date) {
        rowObj[colName] = val.toISOString().split('T')[0];
      } else {
        rowObj[colName] = sanitizeCellValue(val);
      }
    }
    rows.push(rowObj);
  }

  const columns: ColumnMetadata[] = [];
  const columnTypesCount: Record<InferredDataType, number> = {
    text: 0,
    number: 0,
    date: 0,
    percentage: 0,
    category: 0,
    boolean: 0,
  };

  let totalNullCells = 0;
  const sampleSampleSize = Math.min(rows.length, 1000);

  for (let i = 0; i < colNames.length; i++) {
    const colName = colNames[i];
    let nullCount = 0;
    let numberCount = 0;
    let dateCount = 0;
    let percentageCount = 0;
    let booleanCount = 0;
    let textCount = 0;

    const distinctMap = new Map<any, number>();
    const numericValues: number[] = [];
    let minVal: any = null;
    let maxVal: any = null;

    for (let r = 0; r < rows.length; r++) {
      const val = rows[r][colName];
      if (val === null || val === undefined || val === '') {
        nullCount++;
        continue;
      }

      const count = distinctMap.get(val) || 0;
      distinctMap.set(val, count + 1);

      if (r < sampleSampleSize) {
        if (isPercentageValue(val, colName)) {
          percentageCount++;
        } else if (isBooleanValue(val)) {
          booleanCount++;
        } else if (val instanceof Date || isDateString(String(val))) {
          dateCount++;
        } else {
          const num = tryParseNumber(val);
          if (num !== null) {
            numberCount++;
            numericValues.push(num);
          } else {
            textCount++;
          }
        }
      }
    }

    totalNullCells += nullCount;
    const evaluatedRows = Math.max(1, sampleSampleSize - nullCount);

    let dataType: InferredDataType = 'text';

    if (percentageCount / evaluatedRows >= 0.7) {
      dataType = 'percentage';
    } else if (booleanCount / evaluatedRows >= 0.8) {
      dataType = 'boolean';
    } else if (dateCount / evaluatedRows >= 0.7) {
      dataType = 'date';
    } else if (numberCount / evaluatedRows >= 0.7) {
      dataType = 'number';
    } else {
      const cardinality = distinctMap.size;
      if (cardinality > 0 && cardinality <= 50 && (cardinality <= rows.length * 0.25 || rows.length < 50)) {
        dataType = 'category';
      } else {
        dataType = 'text';
      }
    }

    columnTypesCount[dataType]++;

    let avgValue: number | null = null;
    if (dataType === 'number' || dataType === 'percentage') {
      if (numericValues.length > 0) {
        let sum = 0;
        let min = numericValues[0];
        let max = numericValues[0];
        for (const n of numericValues) {
          sum += n;
          if (n < min) min = n;
          if (n > max) max = n;
        }
        minVal = min;
        maxVal = max;
        avgValue = Math.round((sum / numericValues.length) * 100) / 100;
      }
    } else if (dataType === 'date') {
      const dateList = Array.from(distinctMap.keys())
        .map((k) => new Date(k).getTime())
        .filter((t) => !isNaN(t))
        .sort((a, b) => a - b);
      if (dateList.length > 0) {
        minVal = new Date(dateList[0]).toISOString().split('T')[0];
        maxVal = new Date(dateList[dateList.length - 1]).toISOString().split('T')[0];
      }
    }

    const sortedDistinct = Array.from(distinctMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([value, count]) => ({ value, count }));

    const sampleValues = sortedDistinct.slice(0, 5).map((d) => d.value);

    columns.push({
      id: `col_${i}_${colName.replace(/\W+/g, '_')}`,
      name: colName,
      dataType,
      cardinality: distinctMap.size,
      minValue: minVal,
      maxValue: maxVal,
      avgValue,
      distinctValues: sortedDistinct,
      nullCount,
      sampleValues,
      orderIndex: i,
    });
  }

  const totalCells = Math.max(1, rows.length * colNames.length);
  const missingDataPercentage = Math.round((totalNullCells / totalCells) * 1000) / 10;

  return {
    sheetNames,
    activeSheet,
    headerRowIndex,
    rowCount: rows.length,
    columnCount: colNames.length,
    columns,
    rows,
    summary: {
      totalRows: rows.length,
      totalColumns: colNames.length,
      columnTypesCount,
      missingDataPercentage,
    },
    warnings,
  };
}

/**
 * Exports client-side filtered data to an XLSX blob or CSV blob
 */
export function exportDataClient(
  rows: Record<string, any>[],
  format: 'xlsx' | 'csv' = 'xlsx',
  fileName = 'filtered_data'
) {
  const cleanRows = sanitizeDataRows(rows);
  const worksheet = XLSX.utils.json_to_sheet(cleanRows);

  if (format === 'csv') {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${fileName}.csv`);
  } else {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Data');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, `${fileName}.xlsx`);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
