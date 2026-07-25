import dotenv from 'dotenv';
import path from 'path';

// Load .env.production (bundled with Vercel function) first, then local .env
dotenv.config({ path: path.join(__dirname, '../../../.env.production') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Runtime env values ────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || '';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'https://temp-sanab.vercel.app';

// ── Mongoose serverless connection cache ──────────────────────────────────────
declare global { var __mongoConn: Promise<typeof mongoose> | null; }
if (!global.__mongoConn) global.__mongoConn = null;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!global.__mongoConn) {
    if (!MONGODB_URI) { console.error('❌ MONGODB_URI not set'); return; }
    global.__mongoConn = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    }).then(m => { console.log('✅ MongoDB connected to:', m.connection.host); return m; });
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

// ── Static import of routes (no dynamic import - Vercel compatible) ───────────
import router from '../routes';
import { errorMiddleware } from '../middlewares/error.middleware';
import { notFoundMiddleware } from '../middlewares/not-found.middleware';

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '🚀 Sanab API is running',
    version: '2.0.0',
    env: process.env.NODE_ENV || 'production',
    db: mongoose.connection.readyState === 1 ? '✅ connected' : '⚠️ disconnected',
    mongodb: MONGODB_URI ? '✅ URI set' : '❌ URI missing',
    timestamp: new Date().toISOString(),
  });
});

// All routes
app.use('/api', router);

// Error handlers
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// ── Vercel Serverless Handler ─────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
  } catch (err: any) {
    console.error('DB connection error:', err.message);
  }
  return app(req as any, res as any);
}
