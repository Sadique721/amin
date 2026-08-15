import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/shared/logger';
import {
  getOtpEmailTemplate,
  getWelcomeEmailTemplate,
  getOrderPlacedEmailTemplate,
  getOrderStatusEmailTemplate,
  getPasswordResetEmailTemplate,
  getLowStockAlertEmailTemplate,
  getSupportInquiryEmailTemplate,
  getNewsletterWelcomeEmailTemplate,
} from './templates';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;
  private static etherealTransporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const host = (env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com').toLowerCase();
      const port = Number(env.SMTP_PORT || process.env.MAIL_PORT || 587);
      const user = (env.SMTP_USER || process.env.MAIL_USERNAME || 'mdsadiqueamin721786@gmail.com').trim();
      const pass = (env.SMTP_PASS || process.env.MAIL_PASSWORD || 'thvmiexrbpfekwqz').trim();

      if (host.includes('gmail') || user.endsWith('@gmail.com')) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user, pass },
          tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' },
          family: 4,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
        } as any);
      } else {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: user && pass ? { user, pass } : undefined,
          tls: { rejectUnauthorized: false },
          family: 4,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
        } as any);
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

  // ── Primary: Resend HTTP API (fastest — sub-second serverless execution) ─────
  private static async sendViaResend(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    fromName?: string;
  }): Promise<boolean> {
    const resendKey = process.env.RESEND_API_KEY || '';
    if (!resendKey || resendKey.includes('PLACEHOLDER') || resendKey.includes('REPLACE') || !resendKey.startsWith('re_')) {
      return false; // Not configured
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${options.fromName || 'AMIN Luxury Atelier'} <onboarding@resend.dev>`,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json() as any;
        logger.info(`[RESEND] ✅ Email delivered to ${options.to} | id: ${data?.id}`);
        return true;
      }
      const errBody = await res.text();
      logger.warn(`[RESEND] Failed (${res.status}): ${errBody}`);
      return false;
    } catch (err: any) {
      logger.warn(`[RESEND] Request error: ${err?.message}`);
      return false;
    }
  }

  private static async sendMailWithFallback(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<boolean> {
    const fromUser = env.SMTP_USER || process.env.MAIL_USERNAME || 'mdsadiqueamin721786@gmail.com';
    logger.info(`[EMAIL SERVICE] Sending to: ${options.to} | Subject: "${options.subject}"`);

    // 1st: Try Resend (instant HTTP call — no SMTP socket penalty)
    const resendOk = await this.sendViaResend({
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    if (resendOk) return true;

    // 2nd: Try Gmail SMTP (Nodemailer)
    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: `"AMIN Luxury Atelier" <${fromUser}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      logger.info(`[GMAIL SMTP] ✅ Delivered to ${options.to} | id: ${info.messageId}`);
      return true;
    } catch (err: any) {
      logger.warn(`[GMAIL SMTP] Failed: ${err?.message || err}`);
      this.transporter = null; // reset so next call retries fresh
    }

    // 3rd: Ethereal (debug fallback — email visible at ethereal.email, not real inbox)
    try {
      logger.info(`[ETHEREAL FALLBACK] Gmail failed — routing via Ethereal test mailer...`);
      const ethereal = await this.getEtherealTransporter();
      const etherealInfo = await ethereal.sendMail({
        from: `"AMIN Luxury Atelier" <no-reply@amin.com>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      const previewUrl = nodemailer.getTestMessageUrl(etherealInfo);
      logger.info(`[ETHEREAL] Email sent — preview: ${previewUrl}`);
    } catch (etherealErr) {
      logger.error(`[ETHEREAL ERROR] All email fallbacks exhausted:`, etherealErr);
    }

    return true;
  }

  // ─── 1. Send OTP Verification Code ──────────────────────────────────────────
  static async sendOTP(email: string, otp: string): Promise<boolean> {
    const template = getOtpEmailTemplate(otp);
    return this.sendMailWithFallback({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  // ─── 2. Send Welcome Email ──────────────────────────────────────────────────
  static async sendWelcome(email: string, name: string): Promise<boolean> {
    const template = getWelcomeEmailTemplate(name, email);
    return this.sendMailWithFallback({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  // ─── 3. Send Order Confirmation Email ───────────────────────────────────────
  static async sendOrderPlaced(email: string, order: any): Promise<boolean> {
    const template = getOrderPlacedEmailTemplate(order, email);
    return this.sendMailWithFallback({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  // ─── 4. Send Order Status Update Email ──────────────────────────────────────
  static async sendOrderStatus(email: string, order: any, newStatus: string, trackingInfo?: any): Promise<boolean> {
    const template = getOrderStatusEmailTemplate(order, newStatus, email, trackingInfo);
    return this.sendMailWithFallback({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  // ─── 5. Send Password Reset Email ───────────────────────────────────────────
  static async sendPasswordReset(email: string, resetUrl: string, name?: string): Promise<boolean> {
    const template = getPasswordResetEmailTemplate(resetUrl, name);
    return this.sendMailWithFallback({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  // ─── 6. Send Low Stock Alert to Admin ───────────────────────────────────────
  static async sendLowStockAlert(adminEmail: string, productName: string, sku: string, currentStock: number): Promise<boolean> {
    const template = getLowStockAlertEmailTemplate(productName, sku, currentStock);
    return this.sendMailWithFallback({
      to: adminEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  // ─── 7. Send Support Inquiry Confirmation ───────────────────────────────────
  static async sendSupportConfirmation(email: string, ticketId: string, name: string, inquiryText: string): Promise<boolean> {
    const template = getSupportInquiryEmailTemplate(ticketId, name, inquiryText);
    return this.sendMailWithFallback({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  // ─── 8. Send VIP Newsletter Welcome ─────────────────────────────────────────
  static async sendNewsletterWelcome(email: string, voucherCode = 'AMIN10'): Promise<boolean> {
    const template = getNewsletterWelcomeEmailTemplate(email, voucherCode);
    return this.sendMailWithFallback({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }
}
