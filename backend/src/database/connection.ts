import mongoose from 'mongoose';
import { env } from '@/config/env';

// Serverless connection caching - prevents new connection on every cold start
declare global {
  var __mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global.__mongooseCache;

if (!cached) {
  cached = global.__mongooseCache = { conn: null, promise: null };
}

export const connectDB = async (): Promise<void> => {
  // Already connected
  if (cached!.conn && mongoose.connection.readyState >= 1) {
    return;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached!.promise = mongoose.connect(env.MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`🔌 MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (error) {
    cached!.promise = null;
    console.error(`❌ MongoDB connection failed: ${(error as Error).message}`);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  if (cached) {
    cached.conn = null;
    cached.promise = null;
  }
  console.warn('⚠️ MongoDB disconnected!');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});
