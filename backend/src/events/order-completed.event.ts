import { publishEvent, KAFKA_TOPICS } from '@/kafka';

export interface OrderCompletedPayload {
  orderId: string;
  userId?: string;
  userEmail: string;
  orderNumber: string;
  total: number;
  currency: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
}

export async function emitOrderCompleted(payload: OrderCompletedPayload): Promise<void> {
  await publishEvent(KAFKA_TOPICS.ORDER_COMPLETED, payload.orderId, payload);
}

export async function emitOrderCancelled(orderId: string, reason: string): Promise<void> {
  await publishEvent(KAFKA_TOPICS.ORDER_CANCELLED, orderId, { orderId, reason });
}
