import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseUniversalSpreadsheet } from '../utils/universalParser';
import { sanitizeCellValue, sanitizeDataRows, validateFileMagicBytes } from '../utils/security';

describe('Security Utilities', () => {
  it('should sanitize dangerous formula prefixes with a single quote', () => {
    expect(sanitizeCellValue('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(sanitizeCellValue('+cmd|"/C calc"!A0')).toBe("'+cmd|\"/C calc\"!A0");
    expect(sanitizeCellValue('-10')).toBe("'-10");
    expect(sanitizeCellValue('@HYPERLINK("http://evil.com")')).toBe("'@HYPERLINK(\"http://evil.com\")");
    expect(sanitizeCellValue('\tTAB')).toBe("'\tTAB");
    expect(sanitizeCellValue('\rCR')).toBe("'\rCR");
  });

  it('should leave safe values unchanged', () => {
    expect(sanitizeCellValue('John Doe')).toBe('John Doe');
    expect(sanitizeCellValue(42)).toBe(42);
    expect(sanitizeCellValue('Colombo')).toBe('Colombo');
    expect(sanitizeCellValue(null)).toBe('');
  });

  it('should sanitize entire 2D rows and object arrays', () => {
    const rawRows = [
      { name: 'Alice', cmd: '=1+1', amount: 100 },
      { name: 'Bob', cmd: 'Safe string', amount: 200 },
    ];
    const clean = sanitizeDataRows(rawRows);
    expect(clean[0].cmd).toBe("'=1+1");
    expect(clean[0].name).toBe('Alice');
    expect(clean[1].cmd).toBe('Safe string');
  });

  it('should validate file magic bytes correctly', () => {
    // ZIP / XLSX header: 50 4b 03 04
    const fakeXlsx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
    expect(validateFileMagicBytes(fakeXlsx, 'data.xlsx').isValid).toBe(true);

    // CSV with valid text
    const validCsv = Buffer.from('id,name,age\n1,Alice,25\n2,Bob,30\n');
    expect(validateFileMagicBytes(validCsv, 'users.csv').isValid).toBe(true);

    // CSV with forbidden binary null byte
    const fakeBinaryCsv = Buffer.from([0x61, 0x62, 0x00, 0x64]);
    expect(validateFileMagicBytes(fakeBinaryCsv, 'corrupt.csv').isValid).toBe(false);
  });
});

describe('Universal Spreadsheet Parser', () => {
  it('should dynamically parse a generic sales spreadsheet with diverse column types', () => {
    // Create an in-memory workbook with sample sales data
    const wb = XLSX.utils.book_new();
    const testData = [
      ['District', 'Units Sold', 'Revenue', 'Profit Margin', 'Sale Date', 'Active'],
      ['Colombo', 150, 45000, '25%', '2025-01-15', 'Yes'],
      ['Galle', 80, 24000, '30%', '2025-02-10', 'Yes'],
      ['Kandy', 120, 36000, '22%', '2025-03-05', 'No'],
      ['Colombo', 200, 60000, '28%', '2025-04-12', 'Yes'],
      ['Galle', 95, 28500, '31%', '2025-05-18', 'No'],
      ['Jaffna', 60, 18000, '20%', '2025-06-22', 'Yes'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const result = parseUniversalSpreadsheet(buffer);

    expect(result.rowCount).toBe(6);
    expect(result.columnCount).toBe(6);
    expect(result.sheetNames).toContain('Sales Data');

    // Verify Inferred Column Data Types
    const colDistrict = result.columns.find((c) => c.name === 'District');
    expect(colDistrict).toBeDefined();
    expect(colDistrict?.dataType).toBe('category');
    expect(colDistrict?.distinctValues.map((d) => d.value)).toContain('Colombo');

    const colUnits = result.columns.find((c) => c.name === 'Units Sold');
    expect(colUnits?.dataType).toBe('number');
    expect(colUnits?.minValue).toBe(60);
    expect(colUnits?.maxValue).toBe(200);

    const colMargin = result.columns.find((c) => c.name === 'Profit Margin');
    expect(colMargin?.dataType).toBe('percentage');

    const colDate = result.columns.find((c) => c.name === 'Sale Date');
    expect(colDate?.dataType).toBe('date');

    const colActive = result.columns.find((c) => c.name === 'Active');
    expect(colActive?.dataType).toBe('boolean');
  });

  it('should detect header row when spreadsheet has title banners at top', () => {
    const wb = XLSX.utils.book_new();
    const testData = [
      ['CONFIDENTIAL REPORT - COMPANY ABC'], // Row 0: Banner
      ['Generated on 2025-09-01 by Admin'], // Row 1: Subtitle
      [], // Row 2: Blank
      ['Employee ID', 'Full Name', 'Department', 'Salary'], // Row 3: Real Header!
      ['EMP001', 'Sunil Perera', 'Engineering', 250000],
      ['EMP002', 'Kamal Silva', 'Finance', 180000],
      ['EMP003', 'Nimal Fernando', 'Engineering', 220000],
    ];

    const ws = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(wb, ws, 'Staff');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const result = parseUniversalSpreadsheet(buffer);

    expect(result.headerRowIndex).toBe(3);
    expect(result.rowCount).toBe(3);
    expect(result.columns.map((c) => c.name)).toEqual(['Employee ID', 'Full Name', 'Department', 'Salary']);
  });
});
