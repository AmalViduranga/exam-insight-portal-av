import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import analysisRoutes from './routes/analysis';
import universalRoutes from './routes/universal';

const app = express();

// Trust proxy for reverse proxies on Railway, Koyeb, Vercel, Render
app.set('trust proxy', 1);

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://exam-insight-portal-av.vercel.app',
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, server-to-server, or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check trusted cloud deployment domain suffixes
    try {
      const parsed = new URL(origin);
      if (
        parsed.hostname.endsWith('.vercel.app') ||
        parsed.hostname.endsWith('.railway.app') ||
        parsed.hostname.endsWith('.koyeb.app')
      ) {
        return callback(null, true);
      }

      // Allow any localhost port in local/development environment
      if (process.env.NODE_ENV !== 'production' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
        return callback(null, true);
      }
    } catch {
      // Invalid URL format
    }

    return callback(new Error(`Origin '${origin}' not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// General rate limiter on all API routes
app.use('/api/', apiLimiter);

// Application routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/universal', universalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Excel Insight Platform API',
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
