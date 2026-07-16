import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '@/shared/logger';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

let isRedisConnected = false;
let redisConnection: Redis | null = null;
const registeredQueues: Record<string, Queue> = {};
const registeredProcessors: Record<string, (data: any) => Promise<any>> = {};

// Verify Redis connection on startup
export async function initQueueSystem() {
  return new Promise<boolean>((resolve) => {
    logger.info(`Connecting to Redis at ${REDIS_HOST}:${REDIS_PORT}...`);
    const conn = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      maxRetriesPerRequest: null,
      showFriendlyErrorStack: true,
      retryStrategy(times) {
        if (times > 1) {
          // If connection fails, resolve false and stop retrying
          logger.warn(`Redis is offline at ${REDIS_HOST}:${REDIS_PORT}. Falling back to in-memory job queues.`);
          resolve(false);
          return null; // Stop retrying
        }
        return 1000;
      },
    });

    conn.on('connect', () => {
      logger.info('Successfully connected to Redis. Distributed queue system active.');
      isRedisConnected = true;
      redisConnection = conn;
      resolve(true);
    });

    conn.on('error', (err) => {
      // Suppress connection logs if offline to keep console clean
      if (!isRedisConnected) {
        resolve(false);
      }
    });
  });
}

// Queue registration interface
export function registerQueue(queueName: string, processor: (data: any) => Promise<any>) {
  registeredProcessors[queueName] = processor;

  if (isRedisConnected && redisConnection) {
    try {
      const queue = new Queue(queueName, {
        connection: redisConnection,
      });
      registeredQueues[queueName] = queue;

      // Start BullMQ Worker
      new Worker(
        queueName,
        async (job) => {
          logger.info(`[BULLMQ WORKER] Processing job ${job.id} inside queue: ${queueName}`);
          return processor(job.data);
        },
        { connection: redisConnection }
      );
      logger.info(`[BULLMQ] Registered queue: ${queueName}`);
    } catch (err) {
      logger.error(`Failed to register BullMQ queue ${queueName}:`, err);
    }
  } else {
    logger.info(`[IN-MEMORY QUEUE] Registered queue: ${queueName} (Redis is offline)`);
  }
}

// Job submission helper
export async function addJob(queueName: string, jobName: string, data: any) {
  if (isRedisConnected && registeredQueues[queueName]) {
    try {
      await registeredQueues[queueName].add(jobName, data);
      logger.info(`[BULLMQ] Job added successfully: ${queueName} > ${jobName}`);
    } catch (err) {
      logger.error(`[BULLMQ] Failed to queue job ${jobName}:`, err);
      // Fallback: run in-memory if Redis failed mid-execution
      runInMemory(queueName, data);
    }
  } else {
    runInMemory(queueName, data);
  }
}

// In-Memory async worker execution
function runInMemory(queueName: string, data: any) {
  const processor = registeredProcessors[queueName];
  if (!processor) {
    logger.warn(`No queue processor registered for queue: ${queueName}`);
    return;
  }
  logger.info(`[IN-MEMORY WORKER] Processing queue job in background: ${queueName}`);
  setTimeout(async () => {
    try {
      await processor(data);
    } catch (err) {
      logger.error(`[IN-MEMORY WORKER ERROR] Job failed inside queue: ${queueName}:`, err);
    }
  }, 50); // Async execution block
}
