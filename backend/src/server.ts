import app from './app';
import { env } from './config/env';
import { connectDB } from './database/connection';
import { logger } from './shared/logger';
import { initQueueSystem } from './queues/queue.helper';
import './queues/email.queue';
import './queues/notification.queue';
import { startScheduler } from './jobs/scheduler';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize Queue System
  await initQueueSystem();

  // Start Background Scheduler
  startScheduler();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // Handle Unhandled Rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
  });
};

startServer();
