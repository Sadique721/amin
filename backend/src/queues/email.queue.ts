import { registerQueue, addJob } from './queue.helper';
import { EmailService } from '@/shared/email';

export type EmailJobData =
  | { type: 'otp'; email: string; otp: string }
  | { type: 'welcome'; email: string; name: string }
  | { type: 'order_placed'; email: string; order: any }
  | { type: 'order_status'; email: string; order: any; newStatus: string };

export const emailQueue = {
  add: async (data: EmailJobData) => {
    return addJob('email-queue', `send-${data.type}`, data);
  }
};

// Register queue with worker processor
registerQueue('email-queue', async (data: EmailJobData) => {
  try {
    switch (data.type) {
      case 'otp':
        await EmailService.sendOTP(data.email, data.otp);
        break;
      case 'welcome':
        await EmailService.sendWelcome(data.email, data.name);
        break;
      case 'order_placed':
        await EmailService.sendOrderPlaced(data.email, data.order);
        break;
      case 'order_status':
        await EmailService.sendOrderStatus(data.email, data.order, data.newStatus);
        break;
      default:
        console.warn(`[EMAIL QUEUE] Unknown email job type: ${(data as any)?.type}`);
    }
  } catch (err) {
    console.error(`[EMAIL QUEUE ERROR] Failed to process email job ${data.type}:`, err);
  }
});
