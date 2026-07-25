import mongoose from 'mongoose';
import { env } from '@/config/env';
import { seedDefaultAdmin, seedCmsData, seedProductsAndCategories } from './seed';

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    
    // Initial data seeding
    await seedDefaultAdmin();
    await seedCmsData();
    await seedProductsAndCategories();
  } catch (error) {
    console.error(`❌ Local MongoDB connection error: ${(error as Error).message}`);
    console.warn('⚠️ Starting backend server with in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`🔌 MongoDB In-Memory Connected: ${conn.connection.host}`);
      
      // Seed default admin, customer, cms, and product catalogue data
      await seedDefaultAdmin();
      await seedCmsData();
      await seedProductsAndCategories();
    } catch (memError) {
      console.error(`❌ Failed to start in-memory MongoDB fallback: ${(memError as Error).message}`);
      throw error;
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection pool error: ${err.message}`);
});

