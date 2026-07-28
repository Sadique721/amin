import { Admin } from 'kafkajs';
import { getKafkaClient } from './kafka.client';
import { KAFKA_TOPICS } from './kafka.topics';
import { logger } from '@/shared/logger';

// All topics that should be pre-created on startup
const ALL_TOPICS = Object.values(KAFKA_TOPICS).map((name) => ({
  topic: name,
  numPartitions: 3,
  replicationFactor: 1,
  configEntries: [
    { name: 'retention.ms', value: String(7 * 24 * 60 * 60 * 1000) }, // 7 days
    { name: 'cleanup.policy', value: 'delete' },
  ],
}));

export async function initKafkaTopics(): Promise<void> {
  let admin: Admin | null = null;
  try {
    const kafka = getKafkaClient();
    admin = kafka.admin();
    await admin.connect();

    const existing = await admin.listTopics();
    const toCreate = ALL_TOPICS.filter((t) => !existing.includes(t.topic));

    if (toCreate.length > 0) {
      await admin.createTopics({ topics: toCreate, waitForLeaders: true });
      logger.info(`[Kafka] Topics created: ${toCreate.map((t) => t.topic).join(', ')}`);
    } else {
      logger.info('[Kafka] All topics already exist — skipping creation');
    }
  } catch (err) {
    logger.warn(`[Kafka] Topic init skipped (broker offline?): ${(err as Error).message}`);
  } finally {
    await admin?.disconnect().catch(() => undefined);
  }
}

// Re-export everything for convenient top-level imports
export { initKafkaProducer, publishEvent, disconnectKafkaProducer } from './kafka.producer';
export { createKafkaConsumer, disconnectAllConsumers } from './kafka.consumer';
export { KAFKA_TOPICS } from './kafka.topics';
export type { KafkaTopic } from './kafka.topics';
