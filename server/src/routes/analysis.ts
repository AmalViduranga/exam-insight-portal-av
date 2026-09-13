import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { parseExcelBuffer } from '../utils/excelParser';
import { calculateAllSchoolsSubjectStats } from '../utils/calculations';
import { sanitizeDataRows } from '../utils/security';
import XLSX from 'xlsx';

const router = Router();
const prisma = new PrismaClient();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

router.use(authenticate);

// In-memory store for temporary analysis data
export const temporaryJobStore = new Map<string, any>();

router.post('/upload', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { sheetName } = req.body;
    const { data, sheets } = parseExcelBuffer(req.file.buffer, sheetName);

    if (!data) {
      return res.status(400).json({ message: 'Could not parse data from sheet', sheets });
    }

    const job = await prisma.analysisJob.create({
      data: {
        uploadedById: req.user!.id,
        originalFileName: req.file.originalname,
        status: 'COMPLETED',
        totalRowsRead: data.totalRowsRead,
        schoolsDetected: Object.keys(data.schools).length,
        subjectAttemptsParsed: data.parsedAttemptsCount,
        warningCount: data.warnings.length,
        completedAt: new Date()
      }
    });

    // Store temporarily in memory
    temporaryJobStore.set(job.id, data);
    // Cleanup after 2 hours
    setTimeout(() => temporaryJobStore.delete(job.id), 2 * 60 * 60 * 1000);

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'UPLOAD_EXCEL', details: { jobId: job.id, fileName: req.file.originalname }, ipAddress: (req.ip as any) || '' }
    });

    res.json({
      jobId: job.id,
      sheets,
      metrics: { 
        totalRowsRead: data.totalRowsRead, 
        parsedAttemptsCount: data.parsedAttemptsCount,
        schools: data.schools,
        sheetName: data.sheetName,
        headerRowIndex: data.headerRowIndex,
        fixedSubjectMappings: data.fixedSubjectMappings,
        groupSubjectMappings: data.groupSubjectMappings,
        ignoredColumnsCount: data.ignoredColumnsCount
      },
      warnings: data.warnings,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

router.post('/jobs/:id/school-stats', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { schoolId, subjectNo } = req.body;

    const data = temporaryJobStore.get(id);
    if (!data) {
      return res.status(404).json({ message: 'Analysis job session expired. Please re-upload the Excel file.' });
    }

    const school = data.schools[schoolId];
    if (!school) {
      return res.status(404).json({ message: 'School not found in this dataset.' });
    }

    const attempts = data.attemptsBySchool[schoolId] || [];
    const stats = calculateAllSchoolsSubjectStats(data, subjectNo);
    const schoolStats = stats.find(s => s.schoolId === schoolId);

    res.json({
      school,
      stats: schoolStats || null,
      studentCount: attempts.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/jobs/:id/generate-report', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { subjects, title } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'At least one subject must be selected.' });
    }

    const data = temporaryJobStore.get(id);
    if (!data) {
      return res.status(404).json({ message: 'Analysis job session expired. Please re-upload the Excel file.' });
    }

    const result = await prisma.analysisResult.create({
      data: {
        analysisJobId: id,
        createdById: req.user!.id,
        title: title || `Exam Performance Analysis - ${new Date().toLocaleDateString()}`,
        selectedSubjects: subjects
      }
    });

    const resultRows: any[] = [];

    for (const subjectNo of subjects) {
      const stats = calculateAllSchoolsSubjectStats(data, subjectNo);
      
      // Calculate ranks based on Pass Percentage descending
      const sortedStats = [...stats].sort((a, b) => {
        const passA = parseFloat(a.passPercentage);
        const passB = parseFloat(b.passPercentage);
        
        // Handle N/A
        const isNA_A = isNaN(passA);
        const isNA_B = isNaN(passB);
        if (isNA_A && !isNA_B) return 1;
        if (!isNA_A && isNA_B) return -1;
        if (isNA_A && isNA_B) return 0;

        if (passA !== passB) return passB - passA;
        if (a.satCount !== b.satCount) return b.satCount - a.satCount;
        return a.schoolName.localeCompare(b.schoolName);
      });

      // Assign ranks - FIX: Extract zone and province from school data if available
      sortedStats.forEach((sr, index) => {
        const schoolMeta = data.schools[sr.schoolId] || {};
        resultRows.push({
          analysisResultId: result.id,
          schoolId: sr.schoolId,
          schoolName: sr.schoolName,
          zone: (sr as any).zone || (schoolMeta as any).zone || null,
          province: (sr as any).province || (schoolMeta as any).province || null,
          subjectNo,
          totalDid: sr.totalDid,
          satCount: sr.satCount,
          absentCount: sr.absentCount,
          aCount: sr.aCount,
          bCount: sr.bCount,
          cCount: sr.cCount,
          sCount: sr.sCount,
          wCount: sr.wCount,
          passCount: sr.passCount,
          failCount: sr.failCount,
          passPercentage: sr.passPercentage,
          aPercentage: sr.aPercentage,
          bPercentage: sr.bPercentage,
          cPercentage: sr.cPercentage,
          sPercentage: sr.sPercentage,
          wPercentage: sr.wPercentage,
          absentPercentage: sr.absentPercentage,
          rank: index + 1
        });
      });
    }

    await prisma.analysisResultRow.createMany({
      data: resultRows
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'GENERATE_REPORT', details: { resultId: result.id, subjects }, ipAddress: (req.ip as any) || '' }
    });

    res.json({ resultId: result.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/results', async (req: AuthRequest, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string || '').trim();
    const skip = (page - 1) * limit;

    const whereClause: any = req.user!.role === 'USER' ? { createdById: req.user!.id } : {};
    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }

    const [total, results] = await Promise.all([
      prisma.analysisResult.count({ where: whereClause }),
      prisma.analysisResult.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { createdBy: { select: { fullName: true } }, job: { select: { originalFileName: true } } }
      })
    ]);

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: results
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/results/:id', async (req: AuthRequest, res) => {
  try {
    const result = await prisma.analysisResult.findUnique({
      where: { id: req.params.id as string },
      include: { rows: true, createdBy: { select: { fullName: true } } }
    });
    if (!result) return res.status(404).json({ message: 'Not found' });

    if (req.user!.role === 'USER' && result.createdById !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/results/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const result = await prisma.analysisResult.findUnique({
      where: { id }
    });

    if (!result) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user!.role === 'USER' && result.createdById !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.analysisResult.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE_REPORT',
        details: { reportId: id, title: result.title },
        ipAddress: (req.ip as any) || ''
      }
    });

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/jobs', async (req: AuthRequest, res) => {
  try {
    const jobs = await prisma.analysisJob.findMany({
      where: req.user!.role === 'USER' ? { uploadedById: req.user!.id } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/jobs/:id', async (req: AuthRequest, res) => {
  try {
    const job = await prisma.analysisJob.findUnique({
      where: { id: req.params.id as string }
    });
    if (!job) return res.status(404).json({ message: 'Not found' });
    
    if (req.user!.role === 'USER' && job.uploadedById !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const data = temporaryJobStore.get(job.id);
    if (data) {
      return res.json({
        job,
        jobId: job.id,
        metrics: { 
          totalRowsRead: data.totalRowsRead, 
          parsedAttemptsCount: data.parsedAttemptsCount,
          schools: data.schools,
          sheetName: data.sheetName,
          headerRowIndex: data.headerRowIndex,
          fixedSubjectMappings: data.fixedSubjectMappings,
          groupSubjectMappings: data.groupSubjectMappings,
          ignoredColumnsCount: data.ignoredColumnsCount
        },
        warnings: data.warnings,
        sheets: []
      });
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/results/:id/export/xlsx', async (req: AuthRequest, res) => {
  try {
    const result: any = await prisma.analysisResult.findUnique({
      where: { id: req.params.id as string },
      include: { rows: true }
    });
    if (!result) return res.status(404).json({ message: 'Not found' });

    if (req.user!.role === 'USER' && result.createdById !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const wb = XLSX.utils.book_new();
    const selectedSubjects = result.selectedSubjects as string[];
    const summaryData = [];

    for (const subject of selectedSubjects) {
      const subjectRows = result.rows.filter((r: any) => r.subjectNo === subject);
      if (subjectRows.length === 0) continue;

      const totalSchools = subjectRows.length;
      const totalDid = subjectRows.reduce((acc: any, r: any) => acc + r.totalDid, 0);
      const totalSat = subjectRows.reduce((acc: any, r: any) => acc + r.satCount, 0);
      const totalAbsent = subjectRows.reduce((acc: any, r: any) => acc + r.absentCount, 0);
      const totalPass = subjectRows.reduce((acc: any, r: any) => acc + r.passCount, 0);
      
      const overallPassPercentage = totalSat > 0 ? ((totalPass / totalSat) * 100).toFixed(2) : 'N/A';

      const sorted = [...subjectRows].sort((a: any, b: any) => a.rank - b.rank);
      const highest = sorted[0];
      const lowest = sorted[sorted.length - 1];

      summaryData.push({
        'Subject No': subject,
        'Total Schools': totalSchools,
        'Total Did': totalDid,
        'Total Sat': totalSat,
        'Total Absent': totalAbsent,
        'Total Pass': totalPass,
        'Overall Pass %': overallPassPercentage,
        'Highest Pass % School': highest ? highest.schoolName : 'N/A',
        'Highest Pass %': highest ? highest.passPercentage + '%' : 'N/A',
        'Lowest Pass % School': lowest ? lowest.schoolName : 'N/A',
        'Lowest Pass %': lowest ? lowest.passPercentage + '%' : 'N/A'
      });
    }

    if (summaryData.length > 0) {
      const cleanSummary = sanitizeDataRows(summaryData);
      const wsSummary = XLSX.utils.json_to_sheet(cleanSummary);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    }

    for (const subject of selectedSubjects) {
      const subjectRows = result.rows.filter((r: any) => r.subjectNo === subject);
      if (subjectRows.length === 0) continue;

      const sortedRows = subjectRows.sort((a: any, b: any) => a.rank - b.rank);
      const sheetData = sortedRows.map((r: any) => ({
        Rank: r.rank,
        'School ID': r.schoolId,
        'School Name': r.schoolName,
        Zone: r.zone,
        Province: r.province,
        'Subject No': r.subjectNo,
        'Total Did': r.totalDid,
        Sat: r.satCount,
        Absent: r.absentCount,
        A: r.aCount,
        'A %': r.aPercentage + '%',
        B: r.bCount,
        'B %': r.bPercentage + '%',
        C: r.cCount,
        'C %': r.cPercentage + '%',
        S: r.sCount,
        'S %': r.sPercentage + '%',
        W: r.wCount,
        'W %': r.wPercentage + '%',
        'Pass Count': r.passCount,
        'Fail Count': r.failCount,
        'Pass %': r.passPercentage + '%',
        'Absent %': r.absentPercentage + '%'
      }));

      const cleanSheetData = sanitizeDataRows(sheetData);
      const ws = XLSX.utils.json_to_sheet(cleanSheetData);
      XLSX.utils.book_append_sheet(wb, ws, `Subject_${subject}`);
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'EXPORT_REPORT', details: { resultId: req.params.id as string, format: 'xlsx' }, ipAddress: (req.ip as any) || '' }
    });

    res.setHeader('Content-Disposition', `attachment; filename="Export_${result.id}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/results/:id/export/csv', async (req: AuthRequest, res) => {
  try {
    const result: any = await prisma.analysisResult.findUnique({
      where: { id: req.params.id as string },
      include: { rows: true }
    });
    if (!result) return res.status(404).json({ message: 'Not found' });

    if (req.user!.role === 'USER' && result.createdById !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const sortedRows = result.rows.sort((a: any, b: any) => a.subjectNo.localeCompare(b.subjectNo) || a.rank - b.rank);
    
    const sheetData = sortedRows.map((r: any) => ({
      Rank: r.rank,
      'School ID': r.schoolId,
      'School Name': r.schoolName,
      Zone: r.zone,
      Province: r.province,
      'Subject No': r.subjectNo,
      'Total Did': r.totalDid,
      Sat: r.satCount,
      Absent: r.absentCount,
      A: r.aCount,
      'A %': r.aPercentage + '%',
      B: r.bCount,
      'B %': r.bPercentage + '%',
      C: r.cCount,
      'C %': r.cPercentage + '%',
      S: r.sCount,
      'S %': r.sPercentage + '%',
      W: r.wCount,
      'W %': r.wPercentage + '%',
      'Pass Count': r.passCount,
      'Fail Count': r.failCount,
      'Pass %': r.passPercentage + '%',
      'Absent %': r.absentPercentage + '%'
    }));

    const cleanSheetData = sanitizeDataRows(sheetData);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(cleanSheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'csv' });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'EXPORT_REPORT', details: { resultId: req.params.id as string, format: 'csv' }, ipAddress: (req.ip as any) || '' }
    });

    res.setHeader('Content-Disposition', `attachment; filename="Export_${result.id}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
