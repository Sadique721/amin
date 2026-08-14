import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Master Luxury Email Design System (R3/R4) ─────────────────────────────────
const getFrontendUrl = () => process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || 'https://temp-sanab.vercel.app';

function renderLuxuryEmailLayout(opts: {
  preheader: string;
  badge?: string;
  title: string;
  subtitle?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  footerNote?: string;
}): string {
  const FRONTEND_URL = getFrontendUrl();
  const year = new Date().getFullYear();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${opts.title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, h1, h2, h3, p, a { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #050811; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #e2e8f0;">
  <div style="display: none; font-size: 1px; color: #050811; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${opts.preheader} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050811; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px 36px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0d1322; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);">
          
          <!-- Brand Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #090d16 0%, #171f38 50%, #2a1b0a 100%); padding: 36px 24px 28px 24px; border-bottom: 2px solid #f59e0b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4);">
                      <span style="color: #f59e0b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; font-family: -apple-system, sans-serif;">✨ ${opts.badge || 'AMIN LUXURY ATELIER'}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; font-size: 32px; font-weight: 900; margin: 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: 2px;">AMIN</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 4px;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">FINE JEWELLERY &bull; ANTI-TARNISH &bull; COSMETICS</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #0d1322;">
              <h2 style="color: #f8fafc; font-size: 24px; font-weight: 800; margin: 0 0 10px 0; font-family: Georgia, 'Times New Roman', serif; line-height: 1.3;">
                ${opts.title}
              </h2>
              ${opts.subtitle ? `
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                ${opts.subtitle}
              </p>` : '<div style="margin-bottom: 20px;"></div>'}

              ${opts.contentHtml}

              ${opts.ctaText && opts.ctaUrl ? `
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0 16px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 9999px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #e11d48 100%);">
                          <a href="${opts.ctaUrl}" target="_blank" style="font-size: 15px; font-weight: 800; color: #020617; text-decoration: none; padding: 16px 36px; display: inline-block; border-radius: 9999px; letter-spacing: 0.5px; text-transform: uppercase;">
                            ${opts.ctaText} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${opts.secondaryCtaText && opts.secondaryCtaUrl ? `
              <div style="text-align: center; margin: 8px 0 20px 0;">
                <a href="${opts.secondaryCtaUrl}" target="_blank" style="color: #f59e0b; font-size: 13px; font-weight: 700; text-decoration: underline;">
                  ${opts.secondaryCtaText}
                </a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Security / Privilege Assurance Footer Banner -->
          <tr>
            <td style="background-color: #090e1a; padding: 20px 32px; border-top: 1px solid #1e293b; border-bottom: 1px solid #1e293b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="color: #cbd5e1; font-size: 12px; line-height: 1.7;">
                    <span style="color: #f59e0b; font-weight: 700;">✨ 100% BIS Hallmarked Gold</span> &bull; 
                    <span style="color: #f59e0b; font-weight: 700;">🛡️ Lifetime Anti-Tarnish</span> &bull; 
                    <span style="color: #f59e0b; font-weight: 700;">🚚 Insured Delivery</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Brand Footer -->
          <tr>
            <td align="center" style="background-color: #03060d; padding: 32px 24px; color: #64748b; font-size: 12px; line-height: 1.7;">
              <p style="margin: 0 0 10px 0; color: #94a3b8; font-weight: 700; font-size: 13px;">
                AMIN Luxury Atelier &bull; Haute Joaillerie & Cosmetics
              </p>
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 12px auto 16px auto;">
                <tr>
                  <td style="padding: 0 10px;"><a href="${FRONTEND_URL}/shop" style="color: #f59e0b; text-decoration: none; font-weight: 700;">Collections</a></td>
                  <td style="color: #334155;">&bull;</td>
                  <td style="padding: 0 10px;"><a href="${FRONTEND_URL}/account/orders" style="color: #f59e0b; text-decoration: none; font-weight: 700;">My Orders</a></td>
                  <td style="color: #334155;">&bull;</td>
                  <td style="padding: 0 10px;"><a href="${FRONTEND_URL}/about" style="color: #f59e0b; text-decoration: none; font-weight: 700;">Our Atelier</a></td>
                  <td style="color: #334155;">&bull;</td>
                  <td style="padding: 0 10px;"><a href="${FRONTEND_URL}/contact" style="color: #f59e0b; text-decoration: none; font-weight: 700;">VIP Concierge</a></td>
                </tr>
              </table>

              ${opts.footerNote ? `<p style="margin: 0 0 12px 0; color: #475569; font-size: 11px;">${opts.footerNote}</p>` : ''}
              
              <p style="margin: 0; color: #475569; font-size: 11px;">
                &copy; ${year} AMIN Platform. All rights reserved. This is an official confidential communication regarding your AMIN account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Generic Email Sender with Resend + Gmail Fallback (Always Awaited) ────────
async function sendEmailCore(to: string, subject: string, html: string, text?: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const isResendConfigured = resendKey &&
    !resendKey.includes('REPLACE') &&
    !resendKey.includes('PLACEHOLDER') &&
    resendKey.startsWith('re_');

  // PRIMARY: Resend (instant HTTP call)
  if (isResendConfigured) {
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
          from: 'AMIN Luxury Atelier <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
          text,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        console.log(`[RESEND] ✅ Email delivered to ${to} ("${subject}")`);
        return;
      }
      const errBody = await res.text();
      console.warn(`[RESEND] Failed (${res.status}): ${errBody}`);
    } catch (e: any) {
      console.warn('[RESEND] Error:', e?.message);
    }
  }

  // FALLBACK: Gmail SMTP (Nodemailer)
  try {
    const smtpUser = (process.env.SMTP_USER || process.env.MAIL_USERNAME || 'mdsadiqueamin721786@gmail.com').trim();
    const smtpPass = (process.env.SMTP_PASS || process.env.MAIL_PASSWORD || 'thvmiexrbpfekwqz').trim();

    if (!smtpUser || !smtpPass) {
      console.error('[GMAIL SMTP] SMTP credentials not configured. Email skipped.');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });

    await transporter.sendMail({
      from: `"AMIN Luxury Atelier" <${smtpUser}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`[GMAIL SMTP] ✅ Email delivered to ${to} ("${subject}")`);
  } catch (err: any) {
    console.error('[GMAIL SMTP] ❌ Failed to send email:', err?.message || err);
  }
}

// ── Specific Transactional Senders ────────────────────────────────────────────
async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const subject = `🔒 ${otp} — Your AMIN Verification Code`;
  const text = `AMIN Security Verification Code: ${otp}\nValid for 5 minutes. Never share this code with anyone.`;
  const contentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 8px 0 24px 0;">
      <tr>
        <td align="center" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(244, 63, 94, 0.12) 100%); border: 2px dashed #f59e0b; border-radius: 16px; padding: 24px 16px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; margin-bottom: 8px;">SECURITY AUTHENTICATION CODE</div>
          <div style="font-size: 44px; font-weight: 900; letter-spacing: 12px; color: #ffffff; font-family: monospace; text-shadow: 0 2px 16px rgba(245, 158, 11, 0.5);">${otp}</div>
        </td>
      </tr>
    </table>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px;">
          <div style="color: #f59e0b; font-size: 13px; font-weight: 800; margin-bottom: 4px;">⏱️ Code Expires in 5 Minutes</div>
          <div style="color: #94a3b8; font-size: 12px; line-height: 1.6;">Please enter this code into your active session. AMIN support will never ask for your verification code.</div>
        </td>
      </tr>
    </table>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `Your AMIN verification code is ${otp}. Valid for 5 minutes.`,
    badge: 'SECURITY AUTHORIZATION',
    title: 'Verification Code Required',
    subtitle: 'Enter the 6-digit authorization code below to safely sign in to your AMIN Luxury account.',
    contentHtml,
    footerNote: 'If you did not request this verification code, you can safely ignore this email.',
  });

  await sendEmailCore(to, subject, html, text);
}

async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const FRONTEND_URL = getFrontendUrl();
  const displayName = name || to.split('@')[0] || 'Valued Connoisseur';
  const subject = `✨ Welcome to AMIN Luxury Atelier, ${displayName}!`;
  const text = `Welcome to AMIN, ${displayName}!\nDiscover handcrafted BIS Hallmarked fine jewellery and PRAO Paris Anti-Tarnish everyday luxury.\nShop now: ${FRONTEND_URL}/shop`;

  const contentHtml = `
    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
      We are thrilled to welcome you into our luxury circle. Explore our handcrafted <strong>BIS Hallmarked Fine Jewellery</strong> and revolutionary <strong>PRAO Paris Anti-Tarnish</strong> everyday pieces.
    </p>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
      <tr>
        <td style="padding: 18px 22px; border-bottom: 1px solid #1e293b;">
          <strong style="color: #f59e0b; font-size: 14px; display: block; margin-bottom: 4px;">🏆 100% BIS Hallmarked Pure Gold</strong>
          <span style="color: #94a3b8; font-size: 12px;">Government-accredited certified gold & diamonds with authenticity assurance.</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 22px; border-bottom: 1px solid #1e293b;">
          <strong style="color: #f59e0b; font-size: 14px; display: block; margin-bottom: 4px;">✨ PRAO Paris Lifetime Anti-Tarnish</strong>
          <span style="color: #94a3b8; font-size: 12px;">100% sweat-proof, waterproof, and perfume-resistant everyday luxury.</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 22px;">
          <strong style="color: #f59e0b; font-size: 14px; display: block; margin-bottom: 4px;">🚚 Insured Armored Express Delivery</strong>
          <span style="color: #94a3b8; font-size: 12px;">Transit insurance and tamper-evident packaging straight to your doorstep.</span>
        </td>
      </tr>
    </table>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `Welcome to the AMIN circle, ${displayName}. Explore BIS Hallmarked Jewellery and Anti-Tarnish Collections.`,
    badge: 'VIP ATELIER ACCESS',
    title: `Welcome, ${displayName}! ✨`,
    subtitle: 'Your membership to India’s premier luxury fine jewellery and skincare destination is now active.',
    contentHtml,
    ctaText: 'Explore Collections',
    ctaUrl: `${FRONTEND_URL}/shop`,
    secondaryCtaText: 'Discover Our Atelier Story',
    secondaryCtaUrl: `${FRONTEND_URL}/about`,
  });

  await sendEmailCore(to, subject, html, text);
}

async function sendOrderPlacedEmail(to: string, order: any): Promise<void> {
  const FRONTEND_URL = getFrontendUrl();
  const orderId = order.orderNumber || order._id || order.id || `ORD-${Date.now()}`;
  const total = Number(order.total || 0).toLocaleString('en-IN');
  const subtotal = Number(order.subtotal || order.total || 0).toLocaleString('en-IN');
  const discount = Number(order.discount || 0).toLocaleString('en-IN');
  const tax = Number(order.tax || 0).toLocaleString('en-IN');
  const shipping = Number(order.shipping || 0) === 0 ? 'FREE' : `₹${Number(order.shipping).toLocaleString('en-IN')}`;
  const items = Array.isArray(order.items) ? order.items : [];
  const address = order.shippingAddress || {};

  const subject = `🎉 Order Confirmed #${orderId} — AMIN Luxury Atelier`;
  const text = `Your AMIN order #${orderId} has been confirmed!\nTotal Paid: ₹${total}\nTrack order: ${FRONTEND_URL}/account/orders`;

  const itemsHtml = items.map((item: any) => {
    const pName = item.product?.name || item.name || 'AMIN Luxury Item';
    const price = Number(item.price || item.variant?.price || 0).toLocaleString('en-IN');
    const qty = item.quantity || 1;
    const sku = item.sku || item.variant?.sku || '';
    const imgUrl = item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200';

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #1e293b;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="54" style="vertical-align: top; padding-right: 12px;">
                <img src="${imgUrl}" alt="${pName}" width="48" height="48" style="border-radius: 8px; object-fit: cover; border: 1px solid #334155; display: block;" />
              </td>
              <td style="vertical-align: middle;">
                <div style="color: #f8fafc; font-size: 14px; font-weight: 700;">${pName}</div>
                ${sku ? `<div style="color: #64748b; font-size: 11px;">SKU: ${sku}</div>` : ''}
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #1e293b; color: #cbd5e1; font-size: 13px; text-align: center; vertical-align: middle;">&times;${qty}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #f59e0b; font-size: 14px; font-weight: 800; text-align: right; vertical-align: middle;">₹${price}</td>
      </tr>
    `;
  }).join('');

  const contentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 14px; margin-bottom: 24px; padding: 14px;">
      <tr>
        <td align="center">
          <span style="color: #4ade80; font-size: 16px; font-weight: 800; display: block; margin-bottom: 2px;">🎉 Order Successfully Confirmed</span>
          <span style="color: #94a3b8; font-size: 12px;">Order reference: <strong style="color: #f8fafc;">#${orderId}</strong> &bull; Payment: <strong style="color: #f59e0b; text-transform: uppercase;">${order.paymentMethod || 'Card'}</strong></span>
        </td>
      </tr>
    </table>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
      <thead>
        <tr style="border-bottom: 1px solid #334155; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
          <th style="padding-bottom: 8px;">Masterpiece</th>
          <th style="padding-bottom: 8px; text-align: center;">Qty</th>
          <th style="padding-bottom: 8px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 24px; padding: 16px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="color: #94a3b8; font-size: 13px; padding-bottom: 6px;">Subtotal</td>
              <td style="color: #f8fafc; font-size: 13px; font-weight: 700; text-align: right; padding-bottom: 6px;">₹${subtotal}</td>
            </tr>
            ${order.discount ? `
            <tr>
              <td style="color: #4ade80; font-size: 13px; padding-bottom: 6px;">Discount</td>
              <td style="color: #4ade80; font-size: 13px; font-weight: 700; text-align: right; padding-bottom: 6px;">-₹${discount}</td>
            </tr>` : ''}
            <tr>
              <td style="color: #94a3b8; font-size: 13px; padding-bottom: 6px;">Tax (5%)</td>
              <td style="color: #f8fafc; font-size: 13px; font-weight: 700; text-align: right; padding-bottom: 6px;">₹${tax}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 13px; padding-bottom: 8px;">Insured Shipping</td>
              <td style="color: #4ade80; font-size: 13px; font-weight: 700; text-align: right; padding-bottom: 8px;">${shipping}</td>
            </tr>
            <tr>
              <td style="border-top: 1px solid #334155; color: #ffffff; font-size: 16px; font-weight: 900; padding-top: 8px;">Total Paid</td>
              <td style="border-top: 1px solid #334155; color: #f59e0b; font-size: 18px; font-weight: 900; text-align: right; padding-top: 8px;">₹${total}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `Your AMIN order #${orderId} is confirmed! Total: ₹${total}.`,
    badge: 'ORDER CONFIRMATION',
    title: 'Order Confirmed',
    subtitle: 'Thank you for choosing AMIN Luxury. Our artisans are now crafting your creations.',
    contentHtml,
    ctaText: 'Track Order Status',
    ctaUrl: `${FRONTEND_URL}/account/orders`,
  });

  await sendEmailCore(to, subject, html, text);
}

async function sendOrderStatusEmail(to: string, order: any, newStatus: string): Promise<void> {
  const FRONTEND_URL = getFrontendUrl();
  const orderId = order.orderNumber || order._id || order.id || `ORD-${Date.now()}`;
  const total = Number(order.total || 0).toLocaleString('en-IN');
  const normalized = (newStatus || 'processing').toLowerCase();

  const statusConfig: Record<string, { title: string; color: string; bg: string; icon: string; desc: string }> = {
    pending: { title: 'Order Received', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: '⏳', desc: 'Your order is queued in our atelier.' },
    processing: { title: 'Crafting & Hallmarking', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', icon: '🛠️', desc: 'Our artisans are inspecting, hallmarking, and preparing your order.' },
    shipped: { title: 'Dispatched in Armored Transit', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', icon: '🚚', desc: 'Your order is on the way with our secure armored courier partner.' },
    delivered: { title: 'Delivered Successfully', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', icon: '🎁', desc: 'Your order has been safely delivered. We hope you adore your AMIN pieces.' },
    cancelled: { title: 'Order Cancelled', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', icon: '❌', desc: 'Your order has been cancelled and any payment refunded.' },
  };

  const current = statusConfig[normalized] || {
    title: `Order Updated: ${newStatus.toUpperCase()}`,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    icon: '📦',
    desc: `Your order status has been updated to ${newStatus}.`,
  };

  const subject = `📦 Order #${orderId} Status Update: ${current.title}`;
  const text = `Order #${orderId} Status: ${current.title}\n${current.desc}\nTotal: ₹${total}\nTrack: ${FRONTEND_URL}/account/orders`;

  const contentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${current.bg}; border: 1px solid ${current.color}; border-radius: 14px; margin-bottom: 24px; padding: 20px;">
      <tr>
        <td align="center">
          <div style="font-size: 36px; margin-bottom: 6px;">${current.icon}</div>
          <h3 style="color: ${current.color}; font-size: 20px; font-weight: 900; margin: 0 0 6px 0;">${current.title}</h3>
          <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin: 0;">${current.desc}</p>
        </td>
      </tr>
    </table>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 24px; padding: 16px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="color: #94a3b8; font-size: 13px;">Order Reference:</td>
              <td style="color: #f8fafc; font-size: 13px; font-weight: 700; text-align: right;">#${orderId}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 13px; padding-top: 6px;">Total Amount:</td>
              <td style="color: #f59e0b; font-size: 14px; font-weight: 800; text-align: right; padding-top: 6px;">₹${total}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `Status update for AMIN order #${orderId}: ${current.title}`,
    badge: 'ORDER STATUS UPDATE',
    title: 'Order Status Update',
    subtitle: `Real-time milestone progression for order #${orderId}.`,
    contentHtml,
    ctaText: 'View Order in Account',
    ctaUrl: `${FRONTEND_URL}/account/orders`,
  });

  await sendEmailCore(to, subject, html, text);
}

async function sendNewsletterWelcomeEmail(to: string): Promise<void> {
  const FRONTEND_URL = getFrontendUrl();
  const subject = `👑 Welcome to the AMIN Circle — Your 10% VIP Privilege Code`;
  const text = `Welcome to the AMIN Circle!\nUse code "AMIN10" at checkout for 10% off.\nShop now: ${FRONTEND_URL}/shop`;

  const contentHtml = `
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
      You are now part of our private inner circle. As our gift, enjoy an exclusive <strong>10% privilege discount</strong> on your next fine jewellery or cosmetics purchase:
    </p>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="center" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(244, 63, 94, 0.12) 100%); border: 2px dashed #f59e0b; border-radius: 14px; padding: 20px;">
          <div style="color: #f59e0b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">YOUR VIP VOUCHER CODE</div>
          <div style="color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 6px; font-family: monospace;">AMIN10</div>
          <div style="color: #94a3b8; font-size: 12px; margin-top: 6px;">Apply at checkout on any fine jewellery or skincare creation.</div>
        </td>
      </tr>
    </table>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: 'Your VIP code AMIN10 is ready! Enjoy 10% off fine jewellery and cosmetics.',
    badge: 'PRIVATE CIRCLE',
    title: 'Welcome to the AMIN Circle',
    subtitle: 'Exclusive preview privileges, seasonal trunk shows, and bespoke offers await.',
    contentHtml,
    ctaText: 'Shop New Arrivals',
    ctaUrl: `${FRONTEND_URL}/shop`,
  });

  await sendEmailCore(to, subject, html, text);
}

// Lazy-load db helpers
let _dbModule: any = null;
async function getDb() {
  if (!_dbModule) _dbModule = await import('@/lib/db');
  return _dbModule;
}

// ── Authorize.net Sandbox ─────────────────────────────────────────────────────
const AUTHNET_API_LOGIN_ID = process.env.AUTHORIZENET_API_LOGIN_ID || process.env.AUTHORIZE_NET_API_LOGIN_ID || '';
const AUTHNET_TRANSACTION_KEY = process.env.AUTHORIZENET_TRANSACTION_KEY || process.env.AUTHORIZE_NET_TRANSACTION_KEY || '';

const isProductionAuthNet = process.env.AUTHORIZE_NET_ENVIRONMENT === 'PRODUCTION';
const AUTHNET_ENDPOINT = isProductionAuthNet
  ? 'https://api.authorize.net/xml/v1/request.api'
  : 'https://apitest.authorize.net/xml/v1/request.api';

// ── Response helpers ──────────────────────────────────────────────────────────
function ok(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}
function err(msg: string, status = 400) {
  return NextResponse.json({ success: false, message: msg }, { status });
}

// ── Auth helper ───────────────────────────────────────────────────────────────
async function getUser(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const { verifyAccess } = await getDb();
    const payload = await verifyAccess(auth.slice(7));
    if (!payload) return null;
    const userId = payload.sub || payload.id || payload._id;
    return userId ? { ...payload, id: userId, _id: userId } : null;
  } catch { return null; }
}

// ── Authorize.net charge ──────────────────────────────────────────────────────
async function chargeAuthorizeNet(opts: {
  amount: number; cardNumber: string; expirationDate: string;
  cardCode: string; firstName: string; lastName: string; email?: string; description?: string;
}) {
  const payload = {
    createTransactionRequest: {
      merchantAuthentication: { name: AUTHNET_API_LOGIN_ID, transactionKey: AUTHNET_TRANSACTION_KEY },
      refId: `order-${Date.now()}`,
      transactionRequest: {
        transactionType: 'authCaptureTransaction',
        amount: opts.amount.toFixed(2),
        payment: { creditCard: { cardNumber: opts.cardNumber, expirationDate: opts.expirationDate, cardCode: opts.cardCode } },
        order: { description: opts.description || 'Amin luxury purchase' },
        billTo: { firstName: opts.firstName, lastName: opts.lastName },
      },
    },
  };
  try {
    const res = await fetch(AUTHNET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    const json = JSON.parse(text.replace(/^\uFEFF/, ''));
    const txRes = json?.transactionResponse;

    if (txRes && txRes.responseCode === '1') {
      return {
        transactionId: txRes.transId || `authnet_${Date.now()}`,
        authCode: txRes.authCode || 'APPROVED',
        accountNumber: txRes.accountNumber || `XXXX-${opts.cardNumber.slice(-4)}`,
        message: txRes.messages?.[0]?.description || 'This transaction has been approved.',
      };
    }

    const errMsg = txRes?.errors?.[0]?.errorText || json?.messages?.message?.[0]?.text || 'Card payment declined';
    
    // In Sandbox mode, if sandbox credentials return an error for test cards, fall back to approved sandbox transaction
    const isSandboxEnv = process.env.AUTHORIZE_NET_ENVIRONMENT !== 'PRODUCTION';
    const isDevOrTest = process.env.NODE_ENV !== 'production';

    if (isSandboxEnv && isDevOrTest && (opts.cardNumber.startsWith('4007') || opts.cardNumber.startsWith('4111'))) {
      return {
        transactionId: `authnet_sb_${Date.now()}`,
        authCode: 'SB6001',
        accountNumber: `XXXX-${opts.cardNumber.slice(-4)}`,
        message: 'Approved (Sandbox Test Mode)',
      };
    }

    throw new Error(errMsg);
  } catch (e: any) {
    // Dev + sandbox only: Authorize.net test cards (4007xxx, 4111xxx) that
    // returned an API error (e.g. sandbox downtime) get a synthetic approval.
    // Note: 4242 is a Stripe test card and should never appear here.
    // This path is unreachable when NODE_ENV=production.
    const isSandboxEnv = process.env.AUTHORIZE_NET_ENVIRONMENT !== 'PRODUCTION';
    const isDevOrTest = process.env.NODE_ENV !== 'production';

    if (isSandboxEnv && isDevOrTest && (opts.cardNumber.startsWith('4007') || opts.cardNumber.startsWith('4111'))) {
      return {
        transactionId: `authnet_sb_${Date.now()}`,
        authCode: 'SB6001',
        accountNumber: `XXXX-${opts.cardNumber.slice(-4)}`,
        message: 'Approved (Sandbox Test Fallback)',
      };
    }
    throw e;
  }
}

// ── Cloudinary Upload Helper ──────────────────────────────────────────────────
async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  // Validate file type and size (F3)
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WEBP images are allowed.`);
  }
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSizeBytes) {
    throw new Error('File size exceeds the limit of 5MB.');
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not properly configured. Missing environment variables.');
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = 'amin';
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('folder', folder);
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      console.log(`[CLOUDINARY SUCCESS] Uploaded ${file.name || 'image'} to Cloudinary: ${json.secure_url}`);
      return { url: json.secure_url, publicId: json.public_id };
    }
    const text = await res.text();
    throw new Error(`Cloudinary upload failed with status ${res.status}: ${text}`);
  } catch (e: any) {
    console.error('[CLOUDINARY] Upload error:', e?.message);
    throw new Error(e.message || 'Image upload failed');
  }
}

async function deleteFromCloudinary(publicId: string): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret && !publicId.startsWith('local_')) {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        body: formData,
      });
    } catch (e: any) {
      console.warn('[CLOUDINARY DELETE ERROR]', e?.message);
    }
  }
}

// ── Main Handler ──────────────────────────────────────────────────────────────
async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const route = path.join('/');
  const method = req.method;

  // ── DB init (runs once) ──
  const db = await getDb();
  await db.connectDB();
  const { getModels, bcrypt, signAccess, signRefresh } = db;

  // ── HEALTH ────────────────────────────────────────────────────────────────
  if (route === 'health') {
    return ok({ message: '🚀 Amin API Health OK', version: 'pg-1.0.0', timestamp: new Date().toISOString() });
  }

  // ── FILE UPLOADS ───────────────────────────────────────────────────────────
  // POST /api/upload/single  OR  /api/public/upload/single
  if ((route === 'upload/single' || route === 'public/upload/single') && method === 'POST') {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) return err('No file uploaded', 400);

      const result = await uploadToCloudinary(file);
      return ok(result);
    } catch (e: any) {
      return err(e.message || 'File upload failed', 500);
    }
  }

  // POST /api/upload/delete  OR  /api/public/upload/delete
  if ((route === 'upload/delete' || route === 'public/upload/delete') && method === 'POST') {
    try {
      const body = await req.json();
      const publicId = body.publicId || body.public_id;
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
      return ok({ message: 'Asset deleted successfully' });
    } catch (e: any) {
      return err(e.message || 'Asset deletion failed', 500);
    }
  }

  // ── PUBLIC AUTH ───────────────────────────────────────────────────────────
  // POST /api/public/auth/otp/send
  if ((route === 'public/auth/otp/send' || route === 'auth/otp/send') && method === 'POST') {
    try {
      const body = await req.json();
      const email = (body.email || '').toLowerCase().trim();
      if (!email || !email.includes('@')) return err('Valid email address is required', 400);

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      const { Otp } = await getModels();
      await Otp.save(email, otpCode);

      // Send email via SMTP — must be awaited!
      // On Vercel serverless, fire-and-forget causes the lambda to terminate
      // before the SMTP socket completes, resulting in delayed or missing emails.
      await sendOtpEmail(email, otpCode);

      return ok({ message: 'Verification code sent to your email address' });
    } catch (e: any) {
      return err(e.message || 'Failed to send verification code', 500);
    }
  }

  // POST /api/public/auth/otp/verify
  if ((route === 'public/auth/otp/verify' || route === 'auth/otp/verify') && method === 'POST') {
    try {
      const body = await req.json();
      const email = (body.email || '').toLowerCase().trim();
      const otp = (body.otp || body.code || '').toString().trim();

      if (!email || !otp) return err('Email and OTP verification code are required', 400);

      const { Otp, User } = await getModels();
      const isValid = await Otp.verify(email, otp);

      if (!isValid) {
        return err('Invalid or expired verification code. Please try again.', 401);
      }

      // Check if user exists, else auto-create user
      let user = await User.findByEmail(email);
      let isNewUser = false;
      const adminEmail = (process.env.ADMIN_EMAIL || 'mdsadiqueamin721786@gmail.com').toLowerCase().trim();
      const isAdminEmail = email === adminEmail;

      if (!user) {
        isNewUser = true;
        const rawName = email.split('@')[0].replace(/[^a-zA-Z0-9]+/g, ' ');
        const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        const randomPass = crypto.randomBytes(32).toString('hex');
        const defaultPassword = await bcrypt.hash(randomPass, 10);
        user = await User.create({
          name: formattedName,
          email,
          password: defaultPassword,
          role: isAdminEmail ? 'admin' : 'user',
        });
        // Send welcome email on first account creation (R4)
        await sendWelcomeEmail(email, formattedName);
      } else if (isAdminEmail && user.role !== 'admin') {
        // Ensure admin email always has admin role
        user.role = 'admin';
        await User.update(user._id || user.id, { role: 'admin' });
      }

      const payload = { id: user._id, email: user.email, role: user.role, name: user.name };
      const [accessToken, refreshToken] = await Promise.all([signAccess(payload), signRefresh(payload)]);

      return ok({
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
        message: 'Email verification successful!',
      });
    } catch (e: any) {
      return err(e.message || 'Failed to verify verification code', 500);
    }
  }


  // POST /api/public/auth/password/login  (alias for OTP/verify)
  if ((route === 'public/auth/password/login' || route === 'auth/login') && method === 'POST') {
    try {
      const body = await req.json();
      const email = (body.email || '').toLowerCase().trim();
      const password = body.password || body.otp || '';
      if (!email || !password) return err('Email and password required');
      const { User } = await getModels();
      const user = await User.findByEmail(email);
      if (!user) return err('Invalid email or password. Please try again.', 401);
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return err('Invalid email or password. Please try again.', 401);
      const payload = { id: user._id, email: user.email, role: user.role, name: user.name };
      const [accessToken, refreshToken] = await Promise.all([signAccess(payload), signRefresh(payload)]);
      return ok({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── CATEGORIES ────────────────────────────────────────────────────────────
  // GET /api/categories  OR  /api/public/categories
  if ((route === 'categories' || route === 'public/categories') && method === 'GET') {
    try {
      const { Category } = await getModels();
      const cats = await Category.list();
      return ok({ results: cats, total: cats.length });
    } catch (e: any) { return err(e.message, 500); }
  }

  // POST /api/categories (admin only — create category)
  if ((route === 'categories' || route === 'public/categories') && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const body = await req.json();
      const { Category } = await getModels();
      const cat = await Category.create(body);
      return ok(cat, 201);
    } catch (e: any) { return err(e.message, 500); }
  }

  // PATCH or PUT /api/categories/:id (admin only — update category)
  if (route.startsWith('categories/') && (method === 'PATCH' || method === 'PUT')) {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[path.length - 1];
      const body = await req.json();
      const { Category } = await getModels();
      const cat = await Category.update(id, body);
      if (!cat) return err('Category not found', 404);
      return ok(cat);
    } catch (e: any) { return err(e.message, 500); }
  }

  // DELETE /api/categories/:id (admin only — delete category)
  if (route.startsWith('categories/') && method === 'DELETE') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[path.length - 1];
      const { Category } = await getModels();
      await Category.delete(id);
      return ok({ message: 'Category deleted' });
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── PRODUCTS (public + admin, same URL) ───────────────────────────────────
  // GET /api/products
  if (route === 'products' && method === 'GET') {
    try {
      const { searchParams } = new URL(req.url);
      const { Product } = await getModels();
      const filters = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '12'),
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || '',
        category: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
        maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
        sortBy: searchParams.get('sortBy') || 'newest',
      };
      const currentUser = await getUser(req);
      const data = currentUser?.role === 'admin'
        ? await Product.listAdmin(filters)
        : await Product.list(filters);
      return ok({
        results: data.results,
        products: data.results,
        totalResults: data.total,
        totalPages: data.totalPages,
        page: filters.page,
        limit: filters.limit
      });
    } catch (e: any) { return err(e.message, 500); }
  }

  // POST /api/products (admin only — create product)
  if (route === 'products' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const body = await req.json();
      const { Product } = await getModels();
      const product = await Product.create(body);
      return ok(product, 201);
    } catch (e: any) { return err(e.message, 500); }
  }

  // GET /api/products/facets
  if (route === 'products/facets' && method === 'GET') {
    try {
      const { searchParams } = new URL(req.url);
      const { Product } = await getModels();
      const facets = await Product.facets(searchParams.get('type') || undefined);
      return ok(facets);
    } catch (e: any) { return err(e.message, 500); }
  }

  // GET /api/products/slug/:slug
  if (route.startsWith('products/slug/') && method === 'GET') {
    try {
      const slug = route.replace('products/slug/', '');
      const { Product } = await getModels();
      const prod = await Product.findBySlug(slug);
      if (!prod) return err('Product not found', 404);
      return ok(prod);
    } catch (e: any) { return err(e.message, 500); }
  }

  // GET /api/products/:id
  if (route.startsWith('products/') && !route.includes('/slug/') && method === 'GET') {
    try {
      const id = path[path.length - 1];
      const { Product } = await getModels();
      const prod = await Product.findById(id);
      if (!prod) return err('Product not found', 404);
      return ok(prod);
    } catch (e: any) { return err(e.message, 500); }
  }

  // PATCH /api/products/:id (admin only — update)
  if (route.startsWith('products/') && method === 'PATCH') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[path.length - 1];
      const body = await req.json();
      const { Product } = await getModels();
      const prod = await Product.update(id, body);
      if (!prod) return err('Product not found', 404);
      return ok(prod);
    } catch (e: any) { return err(e.message, 500); }
  }

  // DELETE /api/products/:id (admin only)
  if (route.startsWith('products/') && method === 'DELETE') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[path.length - 1];
      const { Product } = await getModels();
      await Product.delete(id);
      return ok({ message: 'Product deleted' });
    } catch (e: any) { return err(e.message, 500); }
  }

  // PUT /api/products/:id (admin only — full update alias)
  if (route.startsWith('products/') && method === 'PUT') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[path.length - 1];
      const body = await req.json();
      const { Product } = await getModels();
      const prod = await Product.update(id, body);
      return ok(prod);
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── ORDERS ────────────────────────────────────────────────────────────────
  // GET /api/orders/admin/stats
  if (route === 'orders/admin/stats' && method === 'GET') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const { Order } = await getModels();
      const stats = await Order.stats();
      return ok(stats);
    } catch (e: any) { return err(e.message, 500); }
  }

  // GET /api/orders/admin/list
  if (route === 'orders/admin/list' && method === 'GET') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const { searchParams } = new URL(req.url);
      const { Order } = await getModels();
      const data = await Order.listAdmin(
        parseInt(searchParams.get('page') || '1'),
        parseInt(searchParams.get('limit') || '10'),
        searchParams.get('status') || ''
      );
      return ok({ results: data.results, totalResults: data.total, totalPages: data.totalPages });
    } catch (e: any) { return err(e.message, 500); }
  }

  // PATCH /api/orders/admin/:id/status
  if (route.startsWith('orders/admin/') && route.endsWith('/status') && method === 'PATCH') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[2]; // orders/admin/{id}/status
      const body = await req.json();
      const { Order } = await getModels();
      const order = await Order.updateStatus(id, body.status, body.paymentStatus, body.paymentDetails);
      if (!order) return err('Order not found', 404);

      // Send status update notification email (R3/R4)
      if (order.userEmail && body.status) {
        try {
          await sendOrderStatusEmail(order.userEmail, order, body.status);
        } catch (mailErr: any) {
          console.warn('[EMAIL] Order status email notice error:', mailErr?.message);
        }
      }

      return ok(order);
    } catch (e: any) { return err(e.message, 500); }
  }

  // GET /api/orders/my-orders
  if (route === 'orders/my-orders' && method === 'GET') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const { searchParams } = new URL(req.url);
      const { Order } = await getModels();
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      // Search by userId first, then also merge results by email to catch all orders
      const byId = await Order.listByUser(currentUser.id, page, limit);
      const byEmail = await Order.listByUser(currentUser.email, page, limit);
      // Deduplicate by order id
      const seen = new Set<string>();
      const combined: any[] = [];
      for (const o of [...byId.results, ...byEmail.results]) {
        if (!seen.has(o._id)) { seen.add(o._id); combined.push(o); }
      }
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return ok({ results: combined, totalResults: combined.length, totalPages: Math.ceil(combined.length / limit) });
    } catch (e: any) { return err(e.message, 500); }
  }

  // POST /api/orders (create order — full payment + DB persistence)
  if (route === 'orders' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const body = await req.json();
      const { items: cartItems, shippingAddress, couponCode, paymentMethod, paymentDetailsInput } = body;

      if (!cartItems || cartItems.length === 0) return err('No items in order', 400);

      // ── Resolve product details from DB ──
      const { Order, Product } = await getModels();
      const resolvedItems: any[] = [];
      let subtotal = 0;

      for (const ci of cartItems) {
        let prod: any = null;
        try {
          prod = await Product.findById(ci.productId);
          if (!prod) prod = await Product.findBySlug(ci.productId);
        } catch {}

        if (!prod) {
          return err(`Product with ID/slug "${ci.productId}" not found.`, 400);
        }

        const qty = parseInt(ci.quantity) || 1;

        // Check stock availability (C9)
        let hasStock = false;
        let availableStock = 0;
        let matchedVariant = null;

        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
          matchedVariant = prod.variants.find((v: any) => v.sku === ci.sku);
          if (matchedVariant) {
            availableStock = parseInt(matchedVariant.stock) || 0;
            hasStock = availableStock >= qty;
          } else {
            availableStock = parseInt(prod.stock) || 0;
            hasStock = availableStock >= qty;
          }
        } else {
          availableStock = parseInt(prod.stock) || 0;
          hasStock = availableStock >= qty;
        }

        if (!hasStock) {
          return err(`Not enough stock for "${prod.name}" (SKU: ${ci.sku || prod.sku}). Available: ${availableStock}, requested: ${qty}.`, 400);
        }

        const price = prod.salePrice || prod.price;
        const name = prod.name;
        const image = prod.images?.[0] || '';
        subtotal += price * qty;

        resolvedItems.push({
          productId: prod.id,
          name,
          sku: ci.sku || prod.sku || '',
          price,
          quantity: qty,
          image,
          total: price * qty,
        });
      }

      // ── Coupon / discount ──
      let discountAmount = 0;
      if (couponCode === 'AMIN10' || couponCode === 'SANAB10') discountAmount = Math.round(subtotal * 0.10);
      else if (couponCode === 'WELCOME20') discountAmount = Math.round(subtotal * 0.20);

      const shipping = subtotal >= 999 ? 0 : 99;
      const tax = Math.round((subtotal - discountAmount) * 0.05);
      const total = Math.max(0, subtotal - discountAmount + shipping + tax);

      // ── Process Authorize.net payment ──
      let paymentDetails: any = { method: paymentMethod };
      let paymentStatus = 'pending';

      if (paymentMethod === 'authorize_net' && paymentDetailsInput) {
        try {
          const { cardNumber, cardExpiry, cardCvv, cardholderName } = paymentDetailsInput;
          const cleanCard = (cardNumber || '').replace(/\s/g, '');
          const [expMonth, expYear] = (cardExpiry || '/').split('/');
          const expirationDate = `20${(expYear || '').trim()}-${(expMonth || '').trim().padStart(2, '0')}`;
          const nameParts = (cardholderName || currentUser.name || 'Card Holder').trim().split(' ');
          const firstName = nameParts[0] || 'Card';
          const lastName = nameParts.slice(1).join(' ') || 'Holder';

          const txResult = await chargeAuthorizeNet({
            amount: total,
            cardNumber: cleanCard,
            expirationDate,
            cardCode: (cardCvv || '').trim(),
            firstName,
            lastName,
            email: currentUser.email,
            description: `AMIN Order — ${resolvedItems.map(i => i.name).join(', ').slice(0, 60)}`,
          });

          paymentStatus = 'paid';
          paymentDetails = {
            method: 'authorize_net',
            transactionId: txResult.transactionId,
            authCode: txResult.authCode,
            accountNumber: txResult.accountNumber,
            message: txResult.message,
            cardholderName: cardholderName || currentUser.name,
            last4: cleanCard.slice(-4),
            processedAt: new Date().toISOString(),
          };
        } catch (payErr: any) {
          return err(`Payment failed: ${payErr.message || 'Card declined'}`, 402);
        }
      }

      if (paymentMethod === 'razorpay') {
        // Real Razorpay order will be created separately via /api/payments/razorpay/create-order
        // Store order as pending until Razorpay payment is initiated and verified
        paymentStatus = 'pending';
        paymentDetails = { method: 'razorpay', status: 'initiated' };
      }
      if (paymentMethod === 'cod') {
        paymentStatus = 'pending';
        paymentDetails = { method: 'cod', note: 'Pay on delivery' };
      }

      // ── Persist order to PostgreSQL ──
      const order = await Order.create({
        userId: currentUser.id,
        userEmail: currentUser.email,
        items: resolvedItems,
        subtotal,
        tax,
        shipping,
        total,
        couponCode: couponCode || null,
        shippingAddress,
        paymentMethod,
        paymentStatus,
        paymentDetails,
        status: paymentMethod === 'authorize_net' ? 'processing' : 'pending',
      });

      // Decrement stock upon successful order creation (C9)
      for (const item of resolvedItems) {
        await Product.deductStock(item.productId, item.sku, item.quantity);
      }

      // Dispatch order confirmation email immediately (R3/R4)
      if (currentUser.email) {
        try {
          await sendOrderPlacedEmail(currentUser.email, order);
        } catch (mailErr: any) {
          console.warn('[EMAIL] Order confirmation send error:', mailErr?.message);
        }
      }

      return ok(order, 201);
    } catch (e: any) { return err(e.message || 'Order creation failed', 500); }
  }

  // GET /api/orders/:id
  if (route.startsWith('orders/') && method === 'GET') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const id = path[path.length - 1];
      const { Order } = await getModels();
      const order = await Order.findById(id);
      if (!order) return err('Order not found', 404);
      // Allow access if admin, or if order belongs to user (by id OR email)
      const isOwner = order.userId === currentUser.id || order.userEmail === currentUser.email;
      if (currentUser.role !== 'admin' && !isOwner) return err('Access denied', 403);
      return ok(order);
    } catch (e: any) { return err(e.message, 500); }
  }

  // POST /api/orders/verify/cod
  if (route === 'orders/verify/cod' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const { orderId } = await req.json();
      const { Order } = await getModels();
      const order = await Order.updateStatus(orderId, 'processing', 'pending');
      return ok(order);
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── USER PROFILE & ADDRESSES ──────────────────────────────────────────────
  // GET /api/users/profile
  if ((route === 'users/profile' || route === 'public/users/profile') && method === 'GET') {
    const authHeader = req.headers.get('authorization');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (authHeader?.startsWith('Bearer ') && backendUrl) {
      try {
        const backendRes = await fetch(`${backendUrl}/api/public/users/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
        });

        if (backendRes.ok) {
          const data = await backendRes.json();
          return NextResponse.json(data, { status: backendRes.status });
        }
      } catch (e) {}
    }

    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const { User } = await getModels();
      const user = await User.findById(currentUser.id);
      if (!user) return err('User not found', 404);
      return ok({ ...user, addresses: user.addresses || [] });
    } catch (e: any) { return err(e.message, 500); }
  }


  // PATCH /api/users/profile
  if ((route === 'users/profile' || route === 'public/users/profile') && method === 'PATCH') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const body = await req.json();
      const { User } = await getModels();
      const updated = await User.update(currentUser.id, body);
      return ok(updated);
    } catch (e: any) { return err(e.message, 500); }
  }

  // POST /api/users/addresses
  if (route === 'users/addresses' && method === 'POST') {
    const authHeader = req.headers.get('authorization');
    const body = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (authHeader?.startsWith('Bearer ') && backendUrl) {
      try {
        const backendRes = await fetch(`${backendUrl}/api/public/users/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify(body),
        });
        if (backendRes.ok) {
          const data = await backendRes.json();
          return NextResponse.json(data, { status: backendRes.status });
        }
      } catch (e) {}
    }

    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const { User } = await getModels();
      const addresses = await User.addAddress(currentUser.email || currentUser.id, body);
      return ok(addresses || []);
    } catch (e: any) { return err(e.message, 500); }
  }

  // DELETE /api/users/addresses/:addressId
  if (route.startsWith('users/addresses/') && method === 'DELETE') {
    const authHeader = req.headers.get('authorization');
    const addressId = path[path.length - 1];
    const backendUrl = process.env.BACKEND_URL;
    if (authHeader?.startsWith('Bearer ') && backendUrl) {
      try {
        const backendRes = await fetch(`${backendUrl}/api/public/users/addresses/${addressId}`, {
          method: 'DELETE',
          headers: {
            Authorization: authHeader,
          },
        });
        if (backendRes.ok) {
          const data = await backendRes.json();
          return NextResponse.json(data, { status: backendRes.status });
        }
      } catch (e) {}
    }

    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const { User } = await getModels();
      const addresses = await User.deleteAddress(currentUser.email || currentUser.id, addressId);
      return ok(addresses || []);
    } catch (e: any) { return err(e.message, 500); }
  }



  // ── WISHLIST ──────────────────────────────────────────────────────────────
  // GET /api/wishlist OR /api/public/wishlist
  if ((route === 'wishlist' || route === 'public/wishlist') && method === 'GET') {
    const currentUser = await getUser(req);
    if (!currentUser) return ok({ results: [], total: 0 });
    try {
      const { Wishlist } = await getModels();
      const items = await Wishlist.list(currentUser.id);
      return ok({ results: items, total: items.length });
    } catch (e: any) { return err(e.message, 500); }
  }

  // POST /api/wishlist OR /api/public/wishlist
  if ((route === 'wishlist' || route === 'public/wishlist') && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const body = await req.json();
      const productId = body.productId || body.product_id;
      if (!productId) return err('productId is required', 400);

      const { Wishlist } = await getModels();
      const item = await Wishlist.add(currentUser.id, productId);
      return ok({ message: 'Item added to wishlist', item }, 201);
    } catch (e: any) { return err(e.message, 500); }
  }

  // DELETE /api/wishlist/:id OR /api/public/wishlist/:id
  if ((route.startsWith('wishlist/') || route.startsWith('public/wishlist/')) && method === 'DELETE') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const parts = route.split('/');
      const productId = parts[parts.length - 1];
      const { Wishlist } = await getModels();
      await Wishlist.remove(currentUser.id, productId);
      return ok({ message: 'Item removed from wishlist' });
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── ADMIN USERS ───────────────────────────────────────────────────────────
  // GET /api/admin/users
  if (route === 'admin/users' && method === 'GET') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const { searchParams } = new URL(req.url);
      const { User } = await getModels();
      const data = await User.list(
        parseInt(searchParams.get('page') || '1'),
        parseInt(searchParams.get('limit') || '20'),
        searchParams.get('search') || ''
      );
      return ok({ results: data.results, totalResults: data.total });
    } catch (e: any) { return err(e.message, 500); }
  }

  // PATCH /api/admin/users/:id
  if (route.startsWith('admin/users/') && method === 'PATCH') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[path.length - 1];
      const body = await req.json();
      const { User } = await getModels();
      const user = await User.update(id, body);
      return ok(user);
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── CMS — BANNERS ─────────────────────────────────────────────────────────
  // GET /api/cms/banners/all
  if (route === 'cms/banners/all' && method === 'GET') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const { Banner } = await getModels();
      const banners = await Banner.listAll();
      return ok({ results: banners });
    } catch (e: any) { return err(e.message, 500); }
  }

  // GET /api/cms/banners
  if (route === 'cms/banners' && method === 'GET') {
    try {
      const { searchParams } = new URL(req.url);
      const { Banner } = await getModels();
      const banners = await Banner.list(searchParams.get('type') || undefined);
      return ok({ results: banners });
    } catch (e: any) { return err(e.message, 500); }
  }

  // POST /api/cms/banners
  if (route === 'cms/banners' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const body = await req.json();
      const { Banner } = await getModels();
      const banner = await Banner.create(body);
      return ok(banner, 201);
    } catch (e: any) { return err(e.message, 500); }
  }

  // PUT /api/cms/banners/:id
  if (route.startsWith('cms/banners/') && method === 'PUT') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[path.length - 1];
      const body = await req.json();
      const { Banner } = await getModels();
      const banner = await Banner.update(id, body);
      return ok(banner);
    } catch (e: any) { return err(e.message, 500); }
  }

  // DELETE /api/cms/banners/:id
  if (route.startsWith('cms/banners/') && method === 'DELETE') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[path.length - 1];
      const { Banner } = await getModels();
      await Banner.delete(id);
      return ok({ message: 'Banner deleted' });
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── CMS — FAQS ────────────────────────────────────────────────────────────
  // GET /api/cms/faqs/all
  if (route === 'cms/faqs/all' && method === 'GET') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const { Faq } = await getModels();
      return ok({ results: await Faq.listAll() });
    } catch (e: any) { return err(e.message, 500); }
  }

  // GET /api/cms/faqs
  if (route === 'cms/faqs' && method === 'GET') {
    try {
      const { Faq } = await getModels();
      return ok({ results: await Faq.list() });
    } catch (e: any) { return err(e.message, 500); }
  }

  // POST /api/cms/faqs
  if (route === 'cms/faqs' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const { Faq } = await getModels();
      return ok(await Faq.create(await req.json()), 201);
    } catch (e: any) { return err(e.message, 500); }
  }

  // PUT /api/cms/faqs/:id
  if (route.startsWith('cms/faqs/') && method === 'PUT') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[path.length - 1];
      const { Faq } = await getModels();
      return ok(await Faq.update(id, await req.json()));
    } catch (e: any) { return err(e.message, 500); }
  }

  // DELETE /api/cms/faqs/:id
  if (route.startsWith('cms/faqs/') && method === 'DELETE') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const id = path[path.length - 1];
      const { Faq } = await getModels();
      await Faq.delete(id);
      return ok({ message: 'FAQ deleted' });
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── IMAGE UPLOAD (legacy route alias — delegates to uploadToCloudinary helper) ──
  if (route === 'upload' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
      const API_KEY = process.env.CLOUDINARY_API_KEY;
      const API_SECRET = process.env.CLOUDINARY_API_SECRET;
      if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
        return err('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables.', 503);
      }
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) return err('No file provided');
      const result = await uploadToCloudinary(file);
      return ok({ url: result.url, publicId: result.publicId });
    } catch (e: any) { return err(e.message || 'File upload failed', 500); }
  }

  // ── AUTHORIZE.NET PAYMENT ─────────────────────────────────────────────────
  if (route === 'payments/authorize/charge' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const body = await req.json();
      const { amount, cardNumber, expirationDate, cardCode, firstName, lastName, email, orderId, description } = body;
      if (!amount || !cardNumber || !expirationDate || !cardCode) return err('Card details required');
      const result = await chargeAuthorizeNet({ amount, cardNumber, expirationDate, cardCode, firstName: firstName || 'Customer', lastName: lastName || 'User', email, description });
      if (orderId) {
        const { Order } = await getModels();
        await Order.updateStatus(orderId, 'processing', 'paid', { method: 'authorize_net', transactionId: result.transactionId, authCode: result.authCode, status: 'paid' });
      }
      return ok({ ...result, orderId });
    } catch (e: any) { return NextResponse.json({ success: false, message: e.message }, { status: 402 }); }
  }

  // ── RAZORPAY: Create Order ────────────────────────────────────────────────
  // POST /api/payments/razorpay/create-order
  if (route === 'payments/razorpay/create-order' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const body = await req.json();
      const { orderId } = body;
      if (!orderId) return err('orderId is required', 400);

      const { Order } = await getModels();
      const order = await Order.findById(orderId);
      if (!order) return err('Order not found', 404);

      const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

      if (!keyId || !keySecret || keySecret.endsWith('_secret')) {
        // Credentials not configured — return mock for testing
        console.warn('[RAZORPAY] Key secret not configured or is placeholder. Returning mock order.');
        return ok({
          razorpayOrderId: `rzp_mock_${Date.now()}`,
          amount: Math.round((order.total || 100) * 100),
          currency: 'INR',
          keyId: keyId || 'rzp_test_mockkey123',
          isMock: true,
        });
      }

      // Call Razorpay API to create a real order
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round((order.total || 100) * 100), // paise
          currency: 'INR',
          receipt: `rcpt_${orderId.slice(-8)}`,
          notes: { orderId, userId: currentUser.id },
        }),
      });

      if (!rzpRes.ok) {
        const rzpErr = await rzpRes.text();
        console.error('[RAZORPAY] Create order failed:', rzpErr);
        return err(`Razorpay order creation failed: ${rzpErr}`, 502);
      }

      const rzpOrder = await rzpRes.json();

      // Save razorpayOrderId to our order record
      await Order.updateStatus(orderId, order.status || 'pending', 'pending', {
        ...order.paymentDetails,
        method: 'razorpay',
        razorpayOrderId: rzpOrder.id,
        status: 'initiated',
      });

      return ok({
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId,
        isMock: false,
      });
    } catch (e: any) {
      console.error('[RAZORPAY] Error:', e?.message);
      return err(e.message || 'Razorpay error', 500);
    }
  }

  // ── RAZORPAY: Verify Payment ──────────────────────────────────────────────
  // POST /api/orders/verify/razorpay
  if (route === 'orders/verify/razorpay' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const body = await req.json();
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = body;

      if (!razorpayOrderId || !razorpayPaymentId) {
        return err('razorpayOrderId and razorpayPaymentId are required', 400);
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction && !keySecret) {
        return err('Server configuration error: RAZORPAY_KEY_SECRET is missing', 500);
      }

      const isMock = !isProduction && (razorpayOrderId.startsWith('rzp_mock_') || !keySecret || keySecret.endsWith('_secret'));

      if (!isMock) {
        if (!razorpaySignature) {
          return err('Payment signature (razorpaySignature) is required', 400);
        }
        // Verify HMAC SHA256 signature
        const expectedSig = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        if (expectedSig !== razorpaySignature) {
          console.warn('[RAZORPAY] Signature mismatch — payment verification failed');
          return err('Payment signature verification failed', 400);
        }
      }

      // Find order by razorpayOrderId or by orderId
      const { Order } = await getModels();
      let order: any = null;

      if (orderId) {
        order = await Order.findById(orderId);
      }
      if (!order && !razorpayOrderId.startsWith('rzp_mock_')) {
        // Try to find by razorpayOrderId in paymentDetails
        order = await Order.findByRazorpayOrderId?.(razorpayOrderId);
      }

      if (order) {
        await Order.updateStatus(order._id || order.id, 'processing', 'paid', {
          ...order.paymentDetails,
          method: 'razorpay',
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: razorpaySignature || 'verified',
          status: 'paid',
          verifiedAt: new Date().toISOString(),
        });
      }

      return ok({
        message: 'Payment verified successfully',
        orderId: order?._id || order?.id || orderId,
        status: 'paid',
      });
    } catch (e: any) {
      console.error('[RAZORPAY VERIFY]', e?.message);
      return err(e.message || 'Verification error', 500);
    }
  }

  // ── COUPONS validate ─────────────────────────────────────────────────────
  // TODO(P2-A): Replace with a DB-backed Coupon module query once the backend
  // consolidation (Section 3 of the audit) is complete. Until then, this must
  // agree exactly with the codes checked in the order-creation handler above.
  if (route === 'coupons/validate' && method === 'POST') {
    try {
      const body = await req.json();
      const code = (body.couponCode || body.code || '').toString().trim().toUpperCase();
      const COUPONS: Record<string, { discount: number; type: 'percent'; description: string }> = {
        'AMIN10':    { discount: 10, type: 'percent', description: '10% off your order' },
        'SANAB10':   { discount: 10, type: 'percent', description: '10% off your order' },
        'WELCOME20': { discount: 20, type: 'percent', description: '20% off your order' },
      };
      const coupon = COUPONS[code];
      if (!coupon) {
        return ok({ valid: false, message: 'Coupon code is invalid or has expired.' });
      }
      return ok({
        valid: true,
        code,
        discount: coupon.discount,
        discountType: coupon.type,
        description: coupon.description,
        message: `Coupon applied: ${coupon.description}`,
      });
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── ADMIN STATS (legacy route alias) ─────────────────────────────────────
  if (route === 'admin/stats' && method === 'GET') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const { Order, Product, User } = await getModels();
      const [stats, productCount, userCount] = await Promise.all([
        Order.stats(), Product.count(), User.count()
      ]);
      return ok({ ...stats, totalProducts: productCount, totalUsers: userCount });
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── NEWSLETTER (public subscribe) ───────────────────────────────────────
  if ((route === 'newsletter' || route === 'public/newsletter') && method === 'POST') {
    try {
      const body = await req.json();
      const email = (body.email || '').toLowerCase().trim();
      if (!email || !email.includes('@')) return err('Valid email address is required', 400);

      await sendNewsletterWelcomeEmail(email);
      return ok({ message: 'Subscribed to the AMIN Circle successfully! Check your inbox for your 10% privilege code.' });
    } catch (e: any) { return err(e.message, 500); }
  }

  // ── 404 fallback ──────────────────────────────────────────────────────────
  return NextResponse.json({ success: false, message: `Route not found: ${method} /api/${route}` }, { status: 404 });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
