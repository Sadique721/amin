import mongoose from 'mongoose';
import { Pool } from 'pg';
import { env } from '@/config/env';
import { logger } from '@/shared/logger';

let pgPool: Pool | null = null;

export const getPgPool = (): Pool | null => pgPool;

export const connectDB = async (): Promise<void> => {
  // 1. Initialize PostgreSQL Connection
  const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (dbUrl || env.POSTGRES_HOST) {
    try {
      pgPool = new Pool(
        dbUrl
          ? {
              connectionString: dbUrl,
              ssl: { rejectUnauthorized: false },
            }
          : {
              host: env.POSTGRES_HOST || 'localhost',
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
      logger.warn(`⚠️ PostgreSQL Cloud Connection warning: ${(pgErr as Error).message}`);
    }
  }

  // 2. Connect to MongoDB (With local fallback if Atlas cluster is unreachable)
  const primaryMongoUri = env.MONGODB_URI || process.env.MONGODB_URI;
  const fallbackMongoUri = 'mongodb://127.0.0.1:27017/sanab';

  const opts = {
    bufferCommands: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  let connected = false;

  if (primaryMongoUri) {
    try {
      logger.info(`Attempting primary MongoDB connection...`);
      const mongooseInstance = await mongoose.connect(primaryMongoUri, opts);
      logger.info(`🔌 Primary MongoDB Connected: ${mongooseInstance.connection.host}`);
      connected = true;
    } catch (error) {
      logger.warn(`⚠️ Primary MongoDB Atlas connection failed (${(error as Error).message}). Trying local MongoDB fallback...`);
    }
  }

  if (!connected) {
    try {
      const fallbackInstance = await mongoose.connect(fallbackMongoUri, opts);
      logger.info(`🔌 Fallback Local MongoDB Connected: ${fallbackInstance.connection.host}`);
      connected = true;
    } catch (fallbackError) {
      logger.warn(`⚠️ Local MongoDB connection also unavailable: ${(fallbackError as Error).message}`);
    }
  }

  if (connected) {
    try {
      const { seedDefaultAdmin, seedCmsData, seedProductsAndCategories } = await import('./seed');
      await seedDefaultAdmin();
      await seedCmsData();
      await seedProductsAndCategories();
    } catch (seedErr) {
      logger.error(`❌ Seeding error: ${(seedErr as Error).message}`);
    }
  }
};
