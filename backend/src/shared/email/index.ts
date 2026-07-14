import { logger } from '@/shared/logger';

export class EmailService {
  static async sendOTP(email: string, otp: string): Promise<boolean> {
    logger.info(`[EMAIL SERVICE] Sending OTP to ${email}: ${otp}`);
    // Simulate SMTP network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  }
}
