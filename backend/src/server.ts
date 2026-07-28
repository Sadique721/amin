import app from './app';
import { env } from './config/env';
import { connectDB } from './database/connection';
import { logger } from './shared/logger';
import { initQueueSystem } from './queues/queue.helper';
import './queues/email.queue';
import './queues/notification.queue';
import { startScheduler } from './jobs/scheduler';
import { initKafkaTopics, initKafkaProducer, disconnectKafkaProducer, disconnectAllConsumers } from './kafka';

const startServer = async () => {
  // Connect to PostgreSQL / Database
  await connectDB();

  // Initialize Queue System (BullMQ / Redis)
  await initQueueSystem();

  // Initialize Kafka Topics and Producer
  await initKafkaTopics();
  await initKafkaProducer();

  // Start Background Scheduler
  startScheduler();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // Graceful Shutdown Handler
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectKafkaProducer();
      await disconnectAllConsumers();
      logger.info('Server closed. Process terminating.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

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
