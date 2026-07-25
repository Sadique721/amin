import { connectDB } from '../database/connection';
import { dbBackupJob } from '../jobs/db-backup.job';
import mongoose from 'mongoose';

async function run() {
  console.log('Starting manual database backup...');
  await connectDB();
  await dbBackupJob();
  await mongoose.disconnect();
  console.log('Manual database backup completed successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Manual backup failed:', err);
  process.exit(1);
});
