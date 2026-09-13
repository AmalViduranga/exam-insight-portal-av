import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseSpreadsheetClient, sanitizeCellValue, sanitizeDataRows } from '../lib/universalParser';

describe('Client Universal Spreadsheet Parser', () => {
  it('should parse an Excel workbook in memory with diverse data types', () => {
    const wb = XLSX.utils.book_new();
    const testData = [
      ['District', 'Units Sold', 'Revenue', 'Profit Margin', 'Sale Date', 'Active'],
      ['Colombo', 150, 45000, '28%', '2025-01-15', 'Yes'],
      ['Galle', 80, 24000, '32%', '2025-02-10', 'Yes'],
      ['Kandy', 120, 36000, '25%', '2025-03-05', 'No'],
      ['Jaffna', 60, 18000, '22%', '2025-04-20', 'Yes'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

    const result = parseSpreadsheetClient(buffer);

    expect(result.rowCount).toBe(4);
    expect(result.columnCount).toBe(6);

    const colDistrict = result.columns.find((c) => c.name === 'District');
    expect(colDistrict?.dataType).toBe('category');

    const colUnits = result.columns.find((c) => c.name === 'Units Sold');
    expect(colUnits?.dataType).toBe('number');

    const colMargin = result.columns.find((c) => c.name === 'Profit Margin');
    expect(colMargin?.dataType).toBe('percentage');

    const colDate = result.columns.find((c) => c.name === 'Sale Date');
    expect(colDate?.dataType).toBe('date');

    const colActive = result.columns.find((c) => c.name === 'Active');
    expect(colActive?.dataType).toBe('boolean');
  });

  it('should sanitize cell values against formula injection', () => {
    expect(sanitizeCellValue('=1+1')).toBe("'=1+1");
    expect(sanitizeCellValue('+cmd')).toBe("'+cmd");
    expect(sanitizeCellValue('@url')).toBe("'@url");
    expect(sanitizeCellValue('Safe Text')).toBe('Safe Text');

    const sanitizedRows = sanitizeDataRows([{ col: '=SUM(A1:A10)', label: 'Normal' }]);
    expect(sanitizedRows[0].col).toBe("'=SUM(A1:A10)");
    expect(sanitizedRows[0].label).toBe('Normal');
  });
});
