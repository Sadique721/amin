import mongoose from 'mongoose';
import { env } from '@/config/env';
import { seedDefaultAdmin, seedCmsData } from './seed';

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default admin and cms data
    await seedDefaultAdmin();
    await seedCmsData();
  } catch (error) {
    console.error(`❌ Database connection error: ${(error as Error).message}`);
    console.warn('⚠️ Starting backend server with in-memory fallback database...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`🔌 MongoDB In-Memory Connected: ${conn.connection.host}`);
      
      // Seed default admin and cms data
      await seedDefaultAdmin();
      await seedCmsData();
    } catch (memError) {
      console.error(`❌ Failed to start in-memory MongoDB fallback: ${(memError as Error).message}`);
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection pool error: ${err.message}`);
});
