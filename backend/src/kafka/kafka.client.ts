import { Kafka, logLevel } from 'kafkajs';
import { logger } from '@/shared/logger';
import { env } from '@/config/env';

// Use validated env object — single source of truth for Kafka config (avoids
// the mismatch between the raw process.env default here and the Zod-validated
// default of 'localhost:2909' in env.ts).
const KAFKA_BROKERS = env.KAFKA_BROKERS.split(',');
const KAFKA_CLIENT_ID = env.KAFKA_CLIENT_ID;

let kafkaInstance: Kafka | null = null;

export function getKafkaClient(): Kafka {
  if (!kafkaInstance) {
    kafkaInstance = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS,
      connectionTimeout: 1000,
      requestTimeout: 2000,
      retry: {
        initialRetryTime: 100,
        retries: 1,
        maxRetryTime: 500,
      },
      logLevel: logLevel.WARN,
      logCreator: () => ({ namespace, level, label, log }) => {
        const { message, ...rest } = log;
        const line = `[Kafka:${namespace}] ${message} ${Object.keys(rest).length ? JSON.stringify(rest) : ''}`.trim();
        if (level <= logLevel.ERROR) logger.error(line);
        else if (level === logLevel.WARN) logger.warn(line);
        else logger.debug(line);
      },
    });
    logger.info(`✅ KafkaJS client created — brokers: ${KAFKA_BROKERS.join(', ')}`);
  }
  return kafkaInstance;
}
