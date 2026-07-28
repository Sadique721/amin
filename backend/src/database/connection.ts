import mongoose from 'mongoose';
import { Pool } from 'pg';
import { env } from '@/config/env';
import { logger } from '@/shared/logger';

let pgPool: Pool | null = null;

export const getPgPool = (): Pool | null => pgPool;

export const connectDB = async (): Promise<void> => {
  // 1. Initialize PostgreSQL Connection if DATABASE_URL or POSTGRES_HOST is provided
  const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (dbUrl || env.POSTGRES_HOST) {
    try {
      pgPool = new Pool(
        dbUrl
          ? { connectionString: dbUrl, ssl: dbUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false }
          : {
              host: env.POSTGRES_HOST || 'postgres',
              port: env.POSTGRES_PORT || 2543,
              user: env.POSTGRES_USER || 'sanab_admin',
              password: env.POSTGRES_PASSWORD || 'sanab_password_123',
              database: env.POSTGRES_DB || 'defaultdb',
            }
      );
      const client = await pgPool.connect();
      logger.info('🐘 PostgreSQL Database Connected successfully.');
      client.release();
    } catch (pgErr) {
      logger.error(`❌ PostgreSQL Connection Error: ${(pgErr as Error).message}`);
    }
  }

  // 2. Connect to MongoDB if MONGODB_URI is provided
  if (env.MONGODB_URI) {
    try {
      const opts = {
        bufferCommands: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      const mongooseInstance = await mongoose.connect(env.MONGODB_URI, opts);
      logger.info(`🔌 MongoDB Connected: ${mongooseInstance.connection.host}`);
    } catch (error) {
      logger.warn(`⚠️ MongoDB connection skipped or failed: ${(error as Error).message}`);
    }
  }
};
