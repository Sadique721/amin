import { WebhookLog, IWebhookLog } from '../models/webhook-log.model';

export class PaymentRepository {
  async createWebhookLog(data: Partial<IWebhookLog>): Promise<IWebhookLog> {
    return WebhookLog.create(data);
  }

  async findWebhookLogById(id: string): Promise<IWebhookLog | null> {
    return WebhookLog.findById(id);
  }

  async findWebhookLogsByEvent(event: string): Promise<IWebhookLog[]> {
    return WebhookLog.find({ event }).sort({ createdAt: -1 });
  }
}
