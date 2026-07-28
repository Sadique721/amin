import { publishEvent, KAFKA_TOPICS } from '@/kafka';

export interface ProductCreatedPayload {
  productId: string;
  name: string;
  slug: string;
  type: 'jewellery' | 'cosmetics';
  brand: string;
  category: string;
  basePrice: number;
}

export async function emitProductCreated(payload: ProductCreatedPayload): Promise<void> {
  await publishEvent(KAFKA_TOPICS.PRODUCT_CREATED, payload.productId, payload);
}

export async function emitProductUpdated(productId: string, changes: Record<string, unknown>): Promise<void> {
  await publishEvent(KAFKA_TOPICS.PRODUCT_UPDATED, productId, { productId, changes });
}

export async function emitLowStockAlert(productId: string, variantSku: string, stock: number): Promise<void> {
  await publishEvent(KAFKA_TOPICS.LOW_STOCK_ALERT, productId, { productId, variantSku, stock });
}
