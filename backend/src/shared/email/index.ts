import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/shared/logger';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;
  private static etherealTransporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const host = (env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com').toLowerCase();
      const port = Number(env.SMTP_PORT || process.env.MAIL_PORT || 587);
      const user = env.SMTP_USER || process.env.MAIL_USERNAME || 'entitykart@gmail.com';
      const pass = env.SMTP_PASS || process.env.MAIL_PASSWORD || 'phtcxrhzdrwtkwrt';

      if (host.includes('gmail') || user.endsWith('@gmail.com')) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: user && pass ? { user, pass } : undefined,
          tls: { rejectUnauthorized: false },
        });
      }
    }
    return this.transporter;
  }

  private static async getEtherealTransporter(): Promise<nodemailer.Transporter> {
    if (!this.etherealTransporter) {
      const testAccount = await nodemailer.createTestAccount();
      logger.info(`[ETHEREAL MAIL] Generated Ethereal Test Account: ${testAccount.user}`);
      this.etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
    return this.etherealTransporter;
  }

  static async sendOTP(email: string, otp: string): Promise<boolean> {
    const from = env.SMTP_FROM || process.env.MAIL_USERNAME || 'entitykart@gmail.com';

    logger.info(`[EMAIL SERVICE] Initiating email dispatch to ${email} (OTP: ${otp})`);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #00a65a; text-align: center; margin-bottom: 20px;">SANAB - Verification Code</h2>
        <p style="font-size: 15px; color: #333333;">Hello,</p>
        <p style="font-size: 14px; color: #555555;">Your 6-digit verification code to access your SANAB account is:</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; text-align: center; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #00a65a; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #666666; margin-top: 15px;">This code is valid for <strong>5 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0;" />
        <p style="font-size: 11px; color: #999999; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} SANAB Platform. All rights reserved.</p>
      </div>
    `;

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: `"SANAB Security" <${from}>`,
        to: email,
        subject: `${otp} is your SANAB verification code`,
        text: `Your SANAB verification code is: ${otp}. It is valid for 5 minutes.`,
        html: htmlContent,
      });

      logger.info(`[EMAIL SERVICE SUCCESS] Real email delivered to ${email}. MessageId: ${info.messageId}`);
      return true;
    } catch (err: any) {
      logger.warn(`[EMAIL SMTP WARNING] Gmail/SMTP returned: ${err?.message || err}`);
      logger.info(`[ETHREAL FALLBACK] Dispatching live test email via Ethereal Mailer...`);
      
      try {
        const ethereal = await this.getEtherealTransporter();
        const etherealInfo = await ethereal.sendMail({
          from: `"SANAB Security" <no-reply@sanab.com>`,
          to: email,
          subject: `${otp} is your SANAB verification code`,
          text: `Your SANAB verification code is: ${otp}. It is valid for 5 minutes.`,
          html: htmlContent,
        });

        const previewUrl = nodemailer.getTestMessageUrl(etherealInfo);
        logger.info(`[ETHEREAL SUCCESS] Email sent to Ethereal Inbox! View email online: ${previewUrl}`);
        logger.info(`[DEV OTP HINT] Generated OTP for ${email}: ${otp}`);
      } catch (etherealErr) {
        logger.error(`[ETHEREAL ERROR] Failed to send via Ethereal fallback:`, etherealErr);
      }

      this.transporter = null;
      return true;
    }
  }
}
