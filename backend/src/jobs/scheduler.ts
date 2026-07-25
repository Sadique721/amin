import { registerQueue, addJob } from '../queues/queue.helper';
import { cleanTempJob } from './clean-temp.job';
import { dbBackupJob } from './db-backup.job';
import { logger } from '@/shared/logger';

export function startScheduler() {
  logger.info('[SCHEDULER] Initializing background jobs scheduler...');

  // Register clean-temp job queue
  registerQueue('clean-temp-queue', async () => {
    logger.info('[SCHEDULER] Running clean-temp-queue job...');
    await cleanTempJob();
  });

  // Register db-backup job queue
  registerQueue('db-backup-queue', async () => {
    logger.info('[SCHEDULER] Running db-backup-queue job...');
    await dbBackupJob();
  });

  // Trigger immediately on startup (after 5 seconds) to verify they work
  setTimeout(() => {
    addJob('clean-temp-queue', 'clean-temp', {});
    addJob('db-backup-queue', 'db-backup', {});
  }, 5000);

  // Set intervals:
  // clean-temp: every 12 hours (12 * 60 * 60 * 1000)
  setInterval(() => {
    addJob('clean-temp-queue', 'clean-temp', {});
  }, 12 * 60 * 60 * 1000);

  // db-backup: every 24 hours (24 * 60 * 60 * 1000)
  setInterval(() => {
    addJob('db-backup-queue', 'db-backup', {});
  }, 24 * 60 * 60 * 1000);
}
