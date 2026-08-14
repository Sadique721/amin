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
      // Strip sslmode from URL to avoid conflict with explicit ssl config
      const cleanUrl = dbUrl ? dbUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '') : undefined;

      const dbUrlString = cleanUrl || '';
      const useSsl = dbUrlString.includes('sslmode=require') || dbUrlString.includes('ssl=true') || dbUrlString.includes('aivencloud.com') || (env.POSTGRES_HOST && env.POSTGRES_HOST.includes('aivencloud.com'));
      let ssl: any = false;
      if (useSsl) {
        ssl = {
          rejectUnauthorized: true,
        };
        if (env.POSTGRES_CA_CERT) {
          ssl.ca = env.POSTGRES_CA_CERT;
        } else if (env.POSTGRES_CA_PATH) {
          const fs = require('fs');
          ssl.ca = fs.readFileSync(env.POSTGRES_CA_PATH).toString();
        }
      }

      pgPool = new Pool(
        cleanUrl
          ? {
              connectionString: cleanUrl,
              ssl,
            }
          : {
              host: env.POSTGRES_HOST || 'localhost',
              port: env.POSTGRES_PORT || 5432,
              user: env.POSTGRES_USER,
              password: env.POSTGRES_PASSWORD,
              database: env.POSTGRES_DB || 'defaultdb',
              ssl,
            }
      );
      const client = await pgPool.connect();
      const { rows } = await client.query('SELECT version()');
      logger.info(`🐘 PostgreSQL Connected: ${rows[0]?.version?.split(' ').slice(0, 2).join(' ')}`);
      client.release();
    } catch (pgErr) {
      logger.warn(`⚠️ PostgreSQL Cloud Connection warning: ${(pgErr as Error).message}`);
    }
  }

  // 2. Connect to MongoDB (With local fallback if Atlas cluster is unreachable)
  const primaryMongoUri = env.MONGODB_URI || process.env.MONGODB_URI;
  const fallbackMongoUri = 'mongodb://127.0.0.1:27017/amin';

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
