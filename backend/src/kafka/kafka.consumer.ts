import { Consumer, EachMessagePayload } from 'kafkajs';
import { getKafkaClient } from './kafka.client';
import { KafkaTopic } from './kafka.topics';
import { logger } from '@/shared/logger';

type MessageHandler<T = Record<string, unknown>> = (payload: T, rawMessage: EachMessagePayload) => Promise<void>;

const activeConsumers: Consumer[] = [];

export async function createKafkaConsumer(
  groupId: string,
  topics: KafkaTopic[],
  handler: MessageHandler,
): Promise<Consumer | null> {
  try {
    const kafka = getKafkaClient();
    const consumer = kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxWaitTimeInMs: 5000,
    });

    await consumer.connect();
    await consumer.subscribe({ topics, fromBeginning: false });

    await consumer.run({
      eachMessage: async (raw) => {
        const { topic, partition, message } = raw;
        const rawValue = message.value?.toString() ?? '{}';
        try {
          const parsed = JSON.parse(rawValue);
          logger.info(`[Kafka] 📥 Received ← ${topic} [partition=${partition}, offset=${message.offset}]`);
          await handler(parsed, raw);
        } catch (err) {
          logger.error(`[Kafka] Handler error on topic ${topic}: ${(err as Error).message} | raw=${rawValue}`);
        }
      },
    });

    activeConsumers.push(consumer);
    logger.info(`✅ Kafka Consumer connected — group=${groupId}, topics=[${topics.join(', ')}]`);
    return consumer;
  } catch (err) {
    logger.warn(`⚠️  Kafka Consumer failed to connect — group=${groupId}: ${(err as Error).message}`);
    return null;
  }
}

export async function disconnectAllConsumers(): Promise<void> {
  await Promise.all(
    activeConsumers.map((c) =>
      c.disconnect().catch((e) => logger.warn(`[Kafka] Consumer disconnect error: ${e.message}`)),
    ),
  );
  logger.info('[Kafka] All consumers disconnected');
}
