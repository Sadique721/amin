import { Producer, Message } from 'kafkajs';
import { getKafkaClient } from './kafka.client';
import { KafkaTopic } from './kafka.topics';
import { logger } from '@/shared/logger';
import { appEventBus } from '@/events/event-bus';

let producer: Producer | null = null;
let producerConnected = false;

export async function initKafkaProducer(): Promise<void> {
  try {
    const kafka = getKafkaClient();
    producer = kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });
    await producer.connect();
    producerConnected = true;
    logger.info('✅ Kafka Producer connected and ready');
  } catch (err) {
    producerConnected = false;
    logger.warn(`⚠️  Kafka Producer failed to connect — falling back to internal event bus: ${(err as Error).message}`);
  }
}

export async function publishEvent<T extends object>(
  topic: KafkaTopic,
  key: string,
  payload: T,
): Promise<void> {
  // Always emit to in-process event bus for local/serverless handling
  appEventBus.emit(topic, { key, payload, timestamp: new Date().toISOString() });

  if (!producerConnected || !producer) {
    logger.debug(`[EventBus] Internal event emitted for topic: ${topic} (Kafka offline)`);
    return;
  }

  const message: Message = {
    key,
    value: JSON.stringify({ ...payload, _timestamp: new Date().toISOString() }),
    headers: {
      'content-type': 'application/json',
      source: 'amin-backend',
    },
  };

  try {
    await producer.send({ topic, messages: [message] });
    logger.info(`[Kafka] ✉️  Published → ${topic} [key=${key}]`);
  } catch (err) {
    logger.error(`[Kafka] Failed to publish to ${topic}: ${(err as Error).message}`);
  }
}

export async function disconnectKafkaProducer(): Promise<void> {
  if (producer && producerConnected) {
    await producer.disconnect();
    producerConnected = false;
    logger.info('[Kafka] Producer disconnected');
  }
}
