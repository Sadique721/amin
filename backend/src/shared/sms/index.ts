import { env } from '@/config/env';
import { logger } from '@/shared/logger';

// ─── Twilio Client (lazy-loaded to avoid crash if missing) ──────────────────
let twilioClient: any = null;

function getTwilioClient(): any {
  if (twilioClient) return twilioClient;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Twilio = require('twilio');
    const sid = env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
    const token = env.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      logger.warn('[SMS] Twilio credentials not configured – SMS will be logged only.');
      return null;
    }
    twilioClient = new Twilio(sid, token);
    logger.info('[SMS] Twilio client initialized successfully.');
    return twilioClient;
  } catch (e: any) {
    logger.warn(`[SMS] Twilio package not available: ${e?.message}. Install with: npm install twilio`);
    return null;
  }
}

export class TwilioSMSService {
  /**
   * Send an OTP via SMS using Twilio.
   * Falls back to console-logging in development mode.
   */
  static async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const from = env.TWILIO_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER || '+16414546213';
    const message = `Your AMIN verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;

    logger.info(`[SMS SERVICE] Sending OTP to ${phoneNumber}`);

    const client = getTwilioClient();
    if (!client) {
      // Dev fallback: log OTP so developer can still test
      logger.info(`[SMS DEV FALLBACK] OTP for ${phoneNumber}: ${otp}`);
      return true;
    }

    try {
      const result = await client.messages.create({
        body: message,
        from,
        to: phoneNumber,
      });
      logger.info(`[SMS SERVICE SUCCESS] Message SID: ${result.sid} — Status: ${result.status}`);
      return true;
    } catch (err: any) {
      logger.error(`[SMS SERVICE ERROR] Failed to send SMS to ${phoneNumber}: ${err?.message || err}`);
      // Log OTP as dev fallback so auth flow is not broken
      logger.info(`[SMS DEV FALLBACK] OTP for ${phoneNumber}: ${otp}`);
      return false;
    }
  }

  /**
   * Verify Twilio credentials by fetching account info.
   */
  static async verifyCredentials(): Promise<{ success: boolean; accountName?: string; error?: string }> {
    const client = getTwilioClient();
    if (!client) {
      return { success: false, error: 'Twilio not configured or package missing' };
    }
    try {
      const account = await client.api.accounts(
        env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID
      ).fetch();
      return { success: true, accountName: account.friendlyName };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unknown error' };
    }
  }
}

// Legacy export for backwards compatibility
export const smsSender = TwilioSMSService;
