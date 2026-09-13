import * as XLSX from 'xlsx';
import { sanitizeCellValue } from './security';

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

export interface ParseOptions {
  sheetName?: string;
  maxRows?: number; // 10,000 for public, 100,000 for registered
  sanitizeFormulas?: boolean;
}

/**
 * Checks if a string represents an ISO or standard date format.
 */
function isDateString(str: string): boolean {
  if (!str || str.length < 6 || str.length > 35) return false;
  const trimmed = str.trim();

  // Pattern 1: YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, MM/DD/YYYY
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(trimmed) || /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(trimmed)) {
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      const year = new Date(parsed).getFullYear();
      return year >= 1900 && year <= 2100;
    }
  }

  // Pattern 2: Textual dates like "15 Jan 2025" or "October 12, 2024"
  if (/[A-Za-z]{3,9}/.test(trimmed)) {
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      const year = new Date(parsed).getFullYear();
      return year >= 1900 && year <= 2100;
    }
  }

  return false;
}

/**
 * Checks if value is percentage format (e.g., "75.4%", "12%", 0.85 with % header)
 */
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

/**
 * Checks if value is boolean.
 */
function isBooleanValue(val: any): boolean {
  if (typeof val === 'boolean') return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return ['true', 'false', 'yes', 'no', 'y', 'n', 'active', 'inactive'].includes(s);
  }
  return false;
}

/**
 * Converts a raw cell to a numeric float if clean number.
 */
function tryParseNumber(val: any): number | null {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val !== 'string') return null;

  const clean = val.trim().replace(/^[$€£¥Rs.\s]+/, '').replace(/,/g, '');
  if (clean === '') return null;

  // Handle percentages
  if (clean.endsWith('%')) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? null : num / 100;
  }

  const num = Number(clean);
  return isNaN(num) ? null : num;
}

/**
 * Smart Header Row Detection Algorithm.
 * Scans up to 30 rows and calculates a confidence score based on non-empty cell count,
 * string ratio, header value uniqueness, and data type consistency of subsequent rows.
 */
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

    // 1. Density: percentage of filled cells in this row
    const density = nonNullCells.length / row.length;

    // 2. String ratio: headers are usually text strings, not raw numbers
    const stringCells = nonNullCells.filter((c) => typeof c === 'string' && isNaN(Number(c)));
    const stringRatio = stringCells.length / nonNullCells.length;

    // 3. Uniqueness: headers should not repeat identical names within the row
    const uniqueValues = new Set(nonNullCells.map((c) => String(c).trim().toLowerCase()));
    const uniqueness = uniqueValues.size / nonNullCells.length;

    // 4. Lookahead check: do subsequent rows have data?
    let lookaheadBonus = 0;
    if (r + 1 < rawRows.length) {
      const nextRow = rawRows[r + 1];
      const nextNonNull = (nextRow || []).filter((c) => c !== null && c !== undefined && String(c).trim() !== '');
      if (nextNonNull.length >= nonNullCells.length * 0.7) {
        lookaheadBonus = 0.5;
      }
    }

    // Score calculation
    const score = (density * 2) + (stringRatio * 3) + (uniqueness * 2) + lookaheadBonus;

    if (score > highestScore) {
      highestScore = score;
      bestIndex = r;
    }
  }

  return bestIndex;
}

/**
 * Universal Excel & CSV Parser
 * Automatically identifies structure, infers types, and produces dynamic filter schema.
 */
export function parseUniversalSpreadsheet(
  buffer: Buffer | ArrayBuffer,
  options: ParseOptions = {}
): UniversalParsedResult {
  const { sheetName, maxRows = 10000, sanitizeFormulas = true } = options;
  const warnings: string[] = [];

  const readType = Buffer.isBuffer(buffer) ? 'buffer' : 'array';
  const workbook = XLSX.read(buffer, {
    type: readType,
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

  // Convert to 2D Array of raw cell values (preserves blank rows & prevents key collisions)
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
    blankrows: true,
  });

  if (rawRows.length === 0) {
    throw new Error(`The sheet "${activeSheet}" is empty.`);
  }

  // 1. Detect Header Row
  const headerRowIndex = detectHeaderRowIndex(rawRows);
  const rawHeaderRow = rawRows[headerRowIndex] || [];

  // 2. Disambiguate and clean column names, identify empty columns
  const headerCounts: Record<string, number> = {};
  const validColIndices: number[] = [];
  const colNames: string[] = [];

  // Determine max column width across data
  let maxCols = rawHeaderRow.length;
  for (let i = headerRowIndex; i < Math.min(headerRowIndex + 50, rawRows.length); i++) {
    if (rawRows[i] && rawRows[i].length > maxCols) {
      maxCols = rawRows[i].length;
    }
  }

  for (let c = 0; c < maxCols; c++) {
    let rawColName = rawHeaderRow[c] !== null && rawHeaderRow[c] !== undefined ? String(rawHeaderRow[c]).trim() : '';

    // Check if column is completely empty in sample rows
    let hasAnyData = rawColName.length > 0;
    if (!hasAnyData) {
      for (let r = headerRowIndex + 1; r < Math.min(headerRowIndex + 100, rawRows.length); r++) {
        if (rawRows[r] && rawRows[r][c] !== null && rawRows[r][c] !== undefined && String(rawRows[r][c]).trim() !== '') {
          hasAnyData = true;
          break;
        }
      }
    }

    if (!hasAnyData) {
      // Entirely empty column, skip
      continue;
    }

    if (!rawColName) {
      rawColName = `Column_${c + 1}`;
    }

    // Disambiguate duplicates
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

  // 3. Extract and sanitize Data Rows (skipping header row and metadata rows above it)
  const rows: Record<string, any>[] = [];
  const totalAvailableRows = rawRows.length - (headerRowIndex + 1);

  if (totalAvailableRows > maxRows) {
    warnings.push(`Dataset exceeds processing limit of ${maxRows.toLocaleString()} rows. Showing first ${maxRows.toLocaleString()} rows.`);
  }

  const endRowIndex = Math.min(rawRows.length, headerRowIndex + 1 + maxRows);

  for (let r = headerRowIndex + 1; r < endRowIndex; r++) {
    const rawRow = rawRows[r];
    if (!rawRow) continue;

    // Check if entire row is empty
    const isRowEmpty = validColIndices.every((c) => rawRow[c] === null || rawRow[c] === undefined || String(rawRow[c]).trim() === '');
    if (isRowEmpty) continue;

    const rowObj: Record<string, any> = {};
    for (let i = 0; i < validColIndices.length; i++) {
      const colIdx = validColIndices[i];
      const colName = colNames[i];
      let val = rawRow[colIdx];

      if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        rowObj[colName] = null;
      } else if (val instanceof Date) {
        rowObj[colName] = val.toISOString().split('T')[0];
      } else {
        rowObj[colName] = sanitizeFormulas ? sanitizeCellValue(val) : val;
      }
    }
    rows.push(rowObj);
  }

  // 4. Infer Data Types and Compute Column Schema Statistics
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

      // Track distinct values & frequencies
      const count = distinctMap.get(val) || 0;
      distinctMap.set(val, count + 1);

      // Only perform heavy type detection on sample rows
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

    // Determine primary inferred type
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
      // Check if candidate for category: low cardinality distinct values
      const cardinality = distinctMap.size;
      if (cardinality > 0 && cardinality <= 50 && (cardinality <= rows.length * 0.25 || rows.length < 50)) {
        dataType = 'category';
      } else {
        dataType = 'text';
      }
    }

    columnTypesCount[dataType]++;

    // Compute min / max / avg for numbers
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
      // Find earliest and latest date
      const dateList = Array.from(distinctMap.keys())
        .map((k) => new Date(k).getTime())
        .filter((t) => !isNaN(t))
        .sort((a, b) => a - b);
      if (dateList.length > 0) {
        minVal = new Date(dateList[0]).toISOString().split('T')[0];
        maxVal = new Date(dateList[dateList.length - 1]).toISOString().split('T')[0];
      }
    }

    // Sort distinct values by frequency descending (top 100)
    const sortedDistinct = Array.from(distinctMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([value, count]) => ({ value, count }));

    // Sample unique values for UI preview chips
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
