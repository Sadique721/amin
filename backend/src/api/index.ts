import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Inline env validation (no path aliases) ──────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const NODE_ENV = process.env.NODE_ENV || 'production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'https://temp-sanab.vercel.app';

// ── Mongoose connection cache ─────────────────────────────────────────────────
declare global { var __mongoConn: Promise<typeof mongoose> | null; }
global.__mongoConn = global.__mongoConn || null;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!global.__mongoConn) {
    if (!MONGODB_URI) throw new Error('MONGODB_URI not set');
    global.__mongoConn = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });
  }
  await global.__mongoConn;
}

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: ALLOWED_ORIGINS.split(',').map(o => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sanab API is running',
    version: '2.0.0',
    env: NODE_ENV,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── Load all routes dynamically ───────────────────────────────────────────────
let routesLoaded = false;
async function loadRoutes() {
  if (routesLoaded) return;
  try {
    // Set env vars so the main router can use them
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET;
    process.env.JWT_EXPIRES_IN = JWT_EXPIRES_IN;
    process.env.JWT_REFRESH_EXPIRES_IN = JWT_REFRESH_EXPIRES_IN;
    process.env.ADMIN_EMAIL = ADMIN_EMAIL;
    process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
    process.env.NODE_ENV = NODE_ENV;

    const { default: router } = await import('../routes/index');
    app.use('/api', router);
    routesLoaded = true;
    console.log('✅ Routes loaded');
  } catch (err) {
    console.error('❌ Failed to load routes:', err);
  }
}

// ── Vercel Serverless Handler ─────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    await loadRoutes();
  } catch (err: any) {
    console.error('Init error:', err.message);
    if (!routesLoaded) {
      return res.status(503).json({ success: false, message: 'Service initializing, please retry' });
    }
  }
  return app(req as any, res as any);
}
