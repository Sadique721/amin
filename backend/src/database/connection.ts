import mongoose from 'mongoose';
import { env } from '@/config/env';
import { seedDefaultAdmin } from './seed';

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default admin
    await seedDefaultAdmin();
  } catch (error) {
    console.error(`❌ Database connection error: ${(error as Error).message}`);
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection pool error: ${err.message}`);
});
