import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/shared/logger';
import {
  getOtpEmailTemplate,
  getWelcomeEmailTemplate,
  getOrderPlacedEmailTemplate,
  getOrderStatusEmailTemplate,
} from './templates';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;
  private static etherealTransporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const host = (env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com').toLowerCase();
      const port = Number(env.SMTP_PORT || process.env.MAIL_PORT || 465);
      const user = (env.SMTP_USER || process.env.MAIL_USERNAME || 'mdsadiqueamin721786@gmail.com').trim();
      const pass = (env.SMTP_PASS || process.env.MAIL_PASSWORD || 'thvmiexrbpfekwqz').trim();


      if (host.includes('gmail') || user.endsWith('@gmail.com')) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
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

  private static async sendMailWithFallback(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<boolean> {
    const fromUser = env.SMTP_USER || process.env.MAIL_USERNAME || 'entitykart@gmail.com';

    logger.info(`[EMAIL SERVICE] Sending email to: ${options.to} | Subject: "${options.subject}"`);

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: `"SANAB Luxury Atelier" <${fromUser}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info(`[EMAIL SERVICE SUCCESS] Delivered email directly to ${options.to}! MessageId: ${info.messageId}`);
      return true;
    } catch (err: any) {
      logger.warn(`[EMAIL SMTP WARNING] Gmail/SMTP returned: ${err?.message || err}`);
      logger.info(`[ETHREAL FALLBACK] Dispatching live test email via Ethereal Mailer...`);

      try {
        const ethereal = await this.getEtherealTransporter();
        const etherealInfo = await ethereal.sendMail({
          from: `"SANAB Luxury Atelier" <no-reply@sanab.com>`,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(etherealInfo);
        logger.info(`[ETHEREAL SUCCESS] Email sent to Ethereal Inbox! View email online: ${previewUrl}`);
      } catch (etherealErr) {
        logger.error(`[ETHEREAL ERROR] Ethereal fallback error:`, etherealErr);
      }

      this.transporter = null;
      return true;
    }
  }

  // ─── 1. Send OTP Verification Code ──────────────────────────────────────────
  static async sendOTP(email: string, otp: string): Promise<boolean> {
    const htmlContent = getOtpEmailTemplate(otp);
    return this.sendMailWithFallback({
      to: email,
      subject: `✨ ${otp} is your SANAB verification code`,
      text: `Your SANAB verification code is ${otp}. It is valid for 5 minutes.`,
      html: htmlContent,
    });
  }

  // ─── 2. Send Welcome Email ──────────────────────────────────────────────────
  static async sendWelcome(email: string, name: string): Promise<boolean> {
    const htmlContent = getWelcomeEmailTemplate(name, email);
    return this.sendMailWithFallback({
      to: email,
      subject: `👑 Welcome to SANAB & PRAO Paris Luxury Atelier`,
      text: `Welcome to SANAB! Discover our fine jewellery, PRAO anti-tarnish 18K gold collection, and luxury cosmetics.`,
      html: htmlContent,
    });
  }

  // ─── 3. Send Order Confirmation Email ───────────────────────────────────────
  static async sendOrderPlaced(email: string, order: any): Promise<boolean> {
    const htmlContent = getOrderPlacedEmailTemplate(order, email);
    const orderId = order._id || order.id || `SANAB-${Date.now()}`;
    return this.sendMailWithFallback({
      to: email,
      subject: `🎉 Order Confirmation #${orderId} - SANAB Luxury`,
      text: `Your SANAB order #${orderId} has been confirmed! Total: ₹${order.total || 0}`,
      html: htmlContent,
    });
  }

  // ─── 4. Send Order Status Update Email ──────────────────────────────────────
  static async sendOrderStatus(email: string, order: any, newStatus: string): Promise<boolean> {
    const htmlContent = getOrderStatusEmailTemplate(order, newStatus, email);
    const orderId = order._id || order.id || `SANAB-${Date.now()}`;
    return this.sendMailWithFallback({
      to: email,
      subject: `📦 Order #${orderId} Status Update: ${newStatus.toUpperCase()}`,
      text: `Your SANAB order #${orderId} status has been updated to ${newStatus.toUpperCase()}.`,
      html: htmlContent,
    });
  }
}
