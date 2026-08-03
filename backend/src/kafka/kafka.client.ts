import { Kafka, logLevel } from 'kafkajs';
import { logger } from '@/shared/logger';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:2500').split(',');
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'sanab-backend';

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
