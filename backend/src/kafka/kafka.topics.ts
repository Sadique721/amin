export const KAFKA_TOPICS = {
  ORDER_COMPLETED:    'amin.order.completed',
  ORDER_CANCELLED:    'amin.order.cancelled',
  PRODUCT_CREATED:    'amin.product.created',
  PRODUCT_UPDATED:    'amin.product.updated',
  LOW_STOCK_ALERT:    'amin.inventory.low-stock',
  USER_REGISTERED:    'amin.user.registered',
  NOTIFICATION_EMAIL: 'amin.notification.email',
  NOTIFICATION_SMS:   'amin.notification.sms',
} as const;

export type KafkaTopic = typeof KAFKA_TOPICS[keyof typeof KAFKA_TOPICS];
