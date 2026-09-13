/**
 * Security Utilities for Excel Insight Platform
 * Handles Formula Injection Sanitization, MIME & Magic Byte Validation, and Path Sanitization.
 */

// Characters that can trigger formula execution or DDE commands in Excel / Calc
const DANGEROUS_FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Sanitizes a single cell value to prevent CSV / Excel Formula Injection (DDE attacks).
 * If the value starts with a formula trigger character, prepends a single quote (').
 */
export function sanitizeCellValue(val: any): any {
  if (val === null || val === undefined) {
    return '';
  }

  const str = String(val);
  if (str.length === 0) return '';

  const firstChar = str.charAt(0);
  if (DANGEROUS_FORMULA_PREFIXES.includes(firstChar)) {
    // Prefix with single quote to force Excel to treat as plain text
    return `'${str}`;
  }

  return val;
}

/**
 * Sanitizes an entire 2D row array or object record against formula injection.
 */
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

/**
 * Validates file buffer against known magic bytes for spreadsheet formats.
 * Prevents disguised executable uploads (e.g. malware renamed to .xlsx).
 */
export function validateFileMagicBytes(buffer: Buffer, originalName: string): { isValid: boolean; detectedType?: string; error?: string } {
  if (!buffer || buffer.length < 4) {
    return { isValid: false, error: 'File is empty or corrupted' };
  }

  const hexHeader = buffer.slice(0, 8).toString('hex').toLowerCase();
  const ext = originalName.split('.').pop()?.toLowerCase() || '';

  // 1. XLSX (ZIP archive header: 50 4B 03 04)
  if (hexHeader.startsWith('504b0304')) {
    return { isValid: true, detectedType: 'xlsx' };
  }

  // 2. XLS (Compound File Binary Format / OLE2: D0 CF 11 E0)
  if (hexHeader.startsWith('d0cf11e0')) {
    return { isValid: true, detectedType: 'xls' };
  }

  // 3. CSV: Must be valid text without binary control characters (except newline, tab, CR)
  if (ext === 'csv') {
    // Check first 512 bytes for null bytes or suspicious binary sequences
    const sampleSize = Math.min(buffer.length, 512);
    for (let i = 0; i < sampleSize; i++) {
      const byte = buffer[i];
      // Disallow null bytes (0x00) which indicate binary files
      if (byte === 0x00) {
        return { isValid: false, error: 'Invalid CSV format: binary content detected' };
      }
    }
    return { isValid: true, detectedType: 'csv' };
  }

  // If extension is xlsx/xls but header didn't match magic bytes
  if (['xlsx', 'xls'].includes(ext)) {
    return { isValid: false, error: `Corrupted or invalid ${ext.toUpperCase()} file header.` };
  }

  return { isValid: false, error: 'Unsupported file format. Please upload .xlsx, .xls, or .csv.' };
}

/**
 * Sanitizes file name to prevent path traversal, null byte injections, or OS collisions.
 */
export function sanitizeFilename(filename: string): string {
  // Strip path traversal and forbidden characters
  return filename
    .replace(/^.*[\\\/]/, '') // Strip paths
    .replace(/[\x00-\x1f\x80-\x9f]/g, '') // Strip control chars
    .replace(/[^a-zA-Z0-9._\- ]/g, '_') // Replace unusual chars with underscore
    .trim() || 'dataset.xlsx';
}
