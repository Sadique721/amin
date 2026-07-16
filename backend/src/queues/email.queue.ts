import { registerQueue, addJob } from './queue.helper';
import { EmailService } from '@/shared/email';

export const emailQueue = {
  add: async (data: { type: 'otp'; email: string; otp: string }) => {
    return addJob('email-queue', 'send-email', data);
  }
};

// Register queue with worker processor
registerQueue('email-queue', async (data: any) => {
  if (data.type === 'otp') {
    await EmailService.sendOTP(data.email, data.otp);
  }
});
