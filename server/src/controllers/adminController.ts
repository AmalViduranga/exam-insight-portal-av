import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Returns comprehensive real-time database statistics for the Admin Dashboard.
 */
export async function getAdminStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalUsers,
      activeUsers,
      totalDatasets,
      totalReports,
      totalUploads,
      recentLogs,
      recentDatasets,
      fileTypeAggregates,
      columnTypeAggregates,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // Active users count
      prisma.user.count({ where: { isActive: true } }),

      // Total saved datasets
      prisma.dataset.count(),

      // Total reports (Exam + Universal)
      prisma.analysisResult.count(),

      // Total upload attempts recorded
      prisma.uploadHistory.count(),

      // Recent 10 audit logs
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { id: true, username: true, fullName: true, email: true },
          },
        },
      }),

      // Recent datasets
      prisma.dataset.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          originalFileName: true,
          fileSizeBytes: true,
          rowCount: true,
          columnCount: true,
          createdAt: true,
          user: {
            select: { fullName: true, username: true, email: true },
          },
        },
      }),

      // Group upload history by file type
      prisma.uploadHistory.groupBy({
        by: ['fileType'],
        _count: { fileType: true },
      }),

      // Group dataset columns by inferred data type
      prisma.datasetColumn.groupBy({
        by: ['dataType'],
        _count: { dataType: true },
      }),
    ]);

    // Calculate total storage usage in bytes from Datasets
    const datasetStorage = await prisma.dataset.aggregate({
      _sum: { fileSizeBytes: true },
    });
    const totalStorageBytes = Number(datasetStorage._sum.fileSizeBytes || 0);

    // Format popular file types
    const fileTypeCounts: Record<string, number> = { xlsx: 0, xls: 0, csv: 0 };
    fileTypeAggregates.forEach((item: any) => {
      const type = (item.fileType || '').toLowerCase();
      fileTypeCounts[type] = (fileTypeCounts[type] || 0) + item._count.fileType;
    });

    // Format column data types
    const popularDataTypes: Record<string, number> = {};
    columnTypeAggregates.forEach((item: any) => {
      popularDataTypes[item.dataType] = item._count.dataType;
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalDatasets,
        totalReports,
        totalUploads,
        totalStorageBytes,
        totalStorageFormatted: formatBytes(totalStorageBytes),
        fileTypeCounts,
        popularDataTypes,
      },
      recentLogs: recentLogs.map((log: any) => ({
        ...log,
        userName: log.user?.fullName || log.user?.username || log.user?.email || 'System / Guest',
      })),
      recentDatasets: recentDatasets.map((d: any) => ({
        ...d,
        fileSizeBytes: Number(d.fileSizeBytes),
        uploaderName: d.user?.fullName || d.user?.username || d.user?.email || 'Unknown User',
      })),
    });
  } catch (error) {
    next(error);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
