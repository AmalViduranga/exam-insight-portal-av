import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { parseUniversalSpreadsheet } from '../utils/universalParser';
import { validateFileMagicBytes, sanitizeFilename, sanitizeDataRows } from '../utils/security';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Maximum public limits
const PUBLIC_MAX_ROWS = 10000;
const REGISTERED_MAX_ROWS = 100000;
const PUBLIC_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const REGISTERED_MAX_BYTES = 25 * 1024 * 1024; // 25MB

/**
 * Parses any uploaded Excel or CSV file dynamically.
 * Open to public users (with limits) and registered users.
 */
export async function parseSpreadsheet(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded.' });
    }

    const originalName = sanitizeFilename(req.file.originalname);
    const buffer = req.file.buffer;
    const isAuth = !!req.user;
    const maxAllowedBytes = isAuth ? REGISTERED_MAX_BYTES : PUBLIC_MAX_BYTES;
    const maxAllowedRows = isAuth ? REGISTERED_MAX_ROWS : PUBLIC_MAX_ROWS;

    if (buffer.length > maxAllowedBytes) {
      const limitMb = maxAllowedBytes / (1024 * 1024);
      return res.status(413).json({
        success: false,
        message: `File size exceeds the allowed limit of ${limitMb}MB ${isAuth ? '' : 'for free public access. Please create an account for larger files.'}`,
      });
    }

    // 1. Magic byte & MIME security validation
    const magicCheck = validateFileMagicBytes(buffer, originalName);
    if (!magicCheck.isValid) {
      return res.status(400).json({ success: false, message: magicCheck.error });
    }

    // 2. Parse workbook dynamically
    const sheetName = req.body.sheetName as string | undefined;
    const parsed = parseUniversalSpreadsheet(buffer, {
      sheetName,
      maxRows: maxAllowedRows,
      sanitizeFormulas: true,
    });

    // 3. Log to upload history if DB is reachable
    try {
      await prisma.uploadHistory.create({
        data: {
          userId: req.user?.id || null,
          fileName: originalName,
          fileSizeBytes: BigInt(buffer.length),
          fileType: magicCheck.detectedType || 'unknown',
          rowCount: parsed.rowCount,
          status: 'SUCCESS',
          ipAddress: req.ip || '',
        },
      });
    } catch (dbErr) {
      // Non-blocking: continue even if DB logging fails in local/mock environments
      console.warn('[UploadHistory Log Notice]:', (dbErr as any).message);
    }

    res.json({
      success: true,
      fileName: originalName,
      fileSizeBytes: buffer.length,
      isPublic: !isAuth,
      ...parsed,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Saves dataset and extracted columns to Supabase PostgreSQL (registered users).
 */
export async function saveDataset(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to save datasets.' });
    }

    const { name, originalFileName, fileSizeBytes, mimeType, rowCount, columnCount, sheetNames, activeSheet, columns, summary } = req.body;

    if (!name || !originalFileName) {
      return res.status(400).json({ success: false, message: 'Dataset name and file name are required.' });
    }

    const dataset = await prisma.dataset.create({
      data: {
        userId: req.user.id,
        name,
        originalFileName: sanitizeFilename(originalFileName),
        fileSizeBytes: BigInt(fileSizeBytes || 0),
        mimeType: mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        rowCount: rowCount || 0,
        columnCount: columnCount || 0,
        sheetNames: sheetNames || [],
        activeSheet: activeSheet || null,
        summaryMetrics: summary || {},
        columns: {
          create: (columns || []).map((col: any, index: number) => ({
            name: col.name,
            dataType: col.dataType,
            cardinality: col.cardinality || 0,
            minValue: col.minValue !== undefined ? String(col.minValue) : null,
            maxValue: col.maxValue !== undefined ? String(col.maxValue) : null,
            distinctValues: col.distinctValues || [],
            nullCount: col.nullCount || 0,
            sampleValues: col.sampleValues || [],
            orderIndex: index,
          })),
        },
      },
      include: {
        columns: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'SAVE_DATASET',
        details: { datasetId: dataset.id, datasetName: dataset.name, rowCount: dataset.rowCount },
        ipAddress: req.ip || '',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Dataset saved successfully.',
      dataset: {
        ...dataset,
        fileSizeBytes: Number(dataset.fileSizeBytes),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lists user's saved datasets with pagination.
 */
export async function listDatasets(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [total, datasets] = await Promise.all([
      prisma.dataset.count({ where: { userId: req.user.id } }),
      prisma.dataset.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { savedFilters: true, generatedReports: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      datasets: datasets.map((d: any) => ({
        ...d,
        fileSizeBytes: Number(d.fileSizeBytes),
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves a single saved dataset and its column metadata.
 */
export async function getDatasetById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const id = req.params.id as string;
    const dataset = await prisma.dataset.findFirst({
      where: { id, userId: req.user.id },
      include: {
        columns: { orderBy: { orderIndex: 'asc' } },
        savedFilters: true,
      },
    });

    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found.' });
    }

    res.json({
      success: true,
      dataset: {
        ...dataset,
        fileSizeBytes: Number(dataset.fileSizeBytes),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a dataset.
 */
export async function deleteDataset(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const id = req.params.id as string;
    const existing = await prisma.dataset.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Dataset not found.' });
    }

    await prisma.dataset.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_DATASET',
        details: { datasetId: id, name: existing.name },
        ipAddress: req.ip || '',
      },
    });

    res.json({ success: true, message: 'Dataset deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Generates and streams a filtered Excel or CSV file.
 * Includes complete formula injection sanitization.
 */
export async function exportFilteredData(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows, format = 'xlsx', fileName = 'filtered_dataset' } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No rows provided to export.' });
    }

    // 1. Sanitize all rows against formula injection
    const cleanRows = sanitizeDataRows(rows);

    const safeBaseName = sanitizeFilename(fileName).replace(/\.(xlsx|csv|xls)$/i, '');
    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(cleanRows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeBaseName}_${timestamp}.csv"`);
      return res.send(csv);
    } else {
      // Default: XLSX
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(cleanRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Data');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${safeBaseName}_${timestamp}.xlsx"`);
      return res.send(buffer);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Saves custom dynamic filter configuration.
 */
export async function saveFilterConfig(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { datasetId, name, filters } = req.body;
    if (!datasetId || !name || !filters) {
      return res.status(400).json({ success: false, message: 'datasetId, name, and filters are required.' });
    }

    const saved = await prisma.savedFilter.create({
      data: {
        userId: req.user.id,
        datasetId,
        name,
        filters,
      },
    });

    res.status(201).json({ success: true, savedFilter: saved });
  } catch (error) {
    next(error);
  }
}
