import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Load .env.production first (bundled with Vercel function), then fallback to .env
dotenv.config({ path: path.join(__dirname, '../../../.env.production') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

// ── Runtime env values ────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const NODE_ENV = process.env.NODE_ENV || 'production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'https://temp-sanab.vercel.app';

// ── Mongoose serverless connection cache ──────────────────────────────────────
declare global { var __mongoConn: Promise<typeof mongoose> | null; }
if (!global.__mongoConn) global.__mongoConn = null;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!global.__mongoConn) {
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not set');
      return;
    }
    global.__mongoConn = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    }).then(m => { console.log('✅ MongoDB connected'); return m; });
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
app.use(express.urlencoded({ extended: true }));

// ── Health check (no DB needed) ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '🚀 Sanab API is running',
    version: '2.0.0',
    env: NODE_ENV,
    db: mongoose.connection.readyState === 1 ? '✅ connected' : '⚠️ disconnected',
    mongodb: MONGODB_URI ? '✅ URI set' : '❌ URI missing',
    timestamp: new Date().toISOString(),
  });
});

// ── Lazy route loader ─────────────────────────────────────────────────────────
let routesLoaded = false;
async function loadRoutes() {
  if (routesLoaded) return;
  try {
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET;
    process.env.JWT_EXPIRES_IN = JWT_EXPIRES_IN;
    process.env.JWT_REFRESH_EXPIRES_IN = JWT_REFRESH_EXPIRES_IN;
    process.env.ADMIN_EMAIL = ADMIN_EMAIL;
    process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
    process.env.NODE_ENV = NODE_ENV;

    const { default: router } = await import('../routes/index');
    app.use('/api', router);

    // 404 handler
    app.use((_req, res) => {
      res.status(404).json({ success: false, message: 'Route not found' });
    });

    routesLoaded = true;
    console.log('✅ All routes loaded');
  } catch (err: any) {
    console.error('❌ Route loading failed:', err.message);
  }
}

// ── Vercel Serverless Handler ─────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await Promise.all([connectDB(), loadRoutes()]);
  } catch (err: any) {
    console.error('Initialization error:', err.message);
  }
  return app(req as any, res as any);
}
