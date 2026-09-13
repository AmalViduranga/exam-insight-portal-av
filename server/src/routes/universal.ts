import { Router } from 'express';
import multer from 'multer';
import { optionalAuthenticate, authenticate } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter';
import {
  parseSpreadsheet,
  saveDataset,
  listDatasets,
  getDatasetById,
  deleteDataset,
  exportFilteredData,
  saveFilterConfig,
} from '../controllers/universalController';

const router = Router();

// Multer memory storage configuration (handles up to 25MB buffers)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// Public + Authenticated parse route
// Rate-limited to prevent abuse
router.post('/parse', uploadLimiter, optionalAuthenticate, upload.single('file'), parseSpreadsheet);

// Filtered export (clean CSV/XLSX with formula sanitization)
router.post('/export', exportFilteredData);

// Registered user dataset operations
router.post('/save', authenticate, saveDataset);
router.get('/datasets', authenticate, listDatasets);
router.get('/datasets/:id', authenticate, getDatasetById);
router.delete('/datasets/:id', authenticate, deleteDataset);

// Custom saved filters
router.post('/filters', authenticate, saveFilterConfig);

export default router;
