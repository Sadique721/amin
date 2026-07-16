import { registerQueue, addJob } from './queue.helper';
import { logger } from '@/shared/logger';

export const notificationQueue = {
  add: async (data: { userId: string; message: string; type: string }) => {
    return addJob('notification-queue', 'send-notification', data);
  }
};

// Register queue with worker processor
registerQueue('notification-queue', async (data: any) => {
  logger.info(`[NOTIFICATION WORKER] Sending notification to user ${data.userId}: [${data.type}] ${data.message}`);
  await new Promise((resolve) => setTimeout(resolve, 300));
});
