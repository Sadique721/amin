export const KAFKA_TOPICS = {
  ORDER_COMPLETED:    'sanab.order.completed',
  ORDER_CANCELLED:    'sanab.order.cancelled',
  PRODUCT_CREATED:    'sanab.product.created',
  PRODUCT_UPDATED:    'sanab.product.updated',
  LOW_STOCK_ALERT:    'sanab.inventory.low-stock',
  USER_REGISTERED:    'sanab.user.registered',
  NOTIFICATION_EMAIL: 'sanab.notification.email',
  NOTIFICATION_SMS:   'sanab.notification.sms',
} as const;

export type KafkaTopic = typeof KAFKA_TOPICS[keyof typeof KAFKA_TOPICS];
