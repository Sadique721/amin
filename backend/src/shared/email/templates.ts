/**
 * AMIN Luxury Atelier — Master Email Design System & Transactional Templates
 * 
 * 100% Table-Based HTML • Outlook, Gmail, Apple Mail Certified • Dark-Mode Safe
 * Luminous 18K Amber Gold (#f59e0b) & Deep Obsidian (#090d16) Aesthetic
 * 
 * Templates Included:
 * 1. OTP Security Verification
 * 2. VIP Member Welcome & Onboarding
 * 3. Order Placed & Confirmation Receipt
 * 4. Order Status Update & Milestone Tracker
 * 5. Password Reset & Account Security
 * 6. Admin Inventory Low Stock Alert
 * 7. Concierge Support Inquiry Receipt
 * 8. VIP Newsletter & Circle Access
 */

const getFrontendUrl = () =>
  process.env.FRONTEND_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://temp-sanab.vercel.app';

export interface EmailLayoutOptions {
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
}

/**
 * Master Luxury Email Frame
 * Guaranteed compatibility across Outlook, Gmail, Apple Mail, and mobile clients.
 */
export function renderLuxuryEmailLayout(opts: EmailLayoutOptions): string {
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
  <!-- Preheader text (hidden in body, shown in inbox preview) -->
  <div style="display: none; font-size: 1px; color: #050811; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${opts.preheader} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050811; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px 36px 12px;">
        <!-- Container Box (600px max) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0d1322; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);">
          
          <!-- Brand Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #090d16 0%, #171f38 50%, #2a1b0a 100%); padding: 36px 24px 28px 24px; border-bottom: 2px solid #f59e0b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4);">
                      <span style="color: #f59e0b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; font-family: -apple-system, sans-serif;">✨ ${opts.badge || 'AMIN & PRAO PARIS'}</span>
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
                    <p style="color: #94a3b8; font-size: 11px; margin: 0; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">FINE JEWELLERY &bull; PRAO ANTI-TARNISH &bull; COSMETICS</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #0d1322;">
              <!-- Title & Subtitle -->
              <h2 style="color: #f8fafc; font-size: 24px; font-weight: 800; margin: 0 0 10px 0; font-family: Georgia, 'Times New Roman', serif; line-height: 1.3;">
                ${opts.title}
              </h2>
              ${opts.subtitle ? `
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                ${opts.subtitle}
              </p>` : '<div style="margin-bottom: 20px;"></div>'}

              <!-- Body Injected Content -->
              ${opts.contentHtml}

              <!-- Action Call to Action Button(s) -->
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
            <td align="center" style="background-color: #03060d; padding: 32px 24px; color: #64748b; font-size: 12px; line-height: 1.7; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 4px 0; color: #f8fafc; font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">
                AMIN Luxury E-Commerce Platform
              </p>
              <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 11px;">
                100% BIS Hallmarked Gold &bull; PRAO Anti-Tarnish Lifetime Guarantee &bull; Express Delivery
              </p>
              
              <div style="border-top: 1px dotted #334155; margin: 16px 0 16px 0;"></div>
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px auto;">
                <tr>
                  <td style="padding: 0 12px;"><a href="${FRONTEND_URL}/shop" style="color: #f59e0b; text-decoration: none; font-weight: 700; font-size: 12px;">Collections</a></td>
                  <td style="color: #475569;">&bull;</td>
                  <td style="padding: 0 12px;"><a href="${FRONTEND_URL}/about" style="color: #f59e0b; text-decoration: none; font-weight: 700; font-size: 12px;">About Atelier</a></td>
                  <td style="color: #475569;">&bull;</td>
                  <td style="padding: 0 12px;"><a href="${FRONTEND_URL}/contact" style="color: #f59e0b; text-decoration: none; font-weight: 700; font-size: 12px;">Concierge Support</a></td>
                </tr>
              </table>

              ${opts.footerNote ? `<p style="margin: 0 0 12px 0; color: #64748b; font-size: 11px;">${opts.footerNote}</p>` : ''}
              
              <p style="margin: 0; color: #475569; font-size: 10px; letter-spacing: 0.3px;">
                &copy; ${year} AMIN Platform. All rights reserved. Confidential transaction communication.
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

// ─── 1. OTP Verification Code Template ──────────────────────────────────────
export function getOtpEmailTemplate(otp: string): { html: string; text: string; subject: string } {
  const subject = `🔒 ${otp} — Your AMIN Verification Code`;
  const text = `AMIN Security Verification Code: ${otp}\n\nEnter the 6-digit verification code below to sign in or confirm your security authorization on AMIN.\nThis code expires in 5 minutes.\n\nNever share your OTP code with anyone. AMIN support will never ask for your verification code.`;

  const contentHtml = `
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
      Enter the 6-digit verification code below to sign in or confirm your security authorization on <strong>AMIN</strong>.
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(244, 63, 94, 0.10) 100%); border: 2px dashed #f59e0b; border-radius: 16px; padding: 28px 16px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; margin-bottom: 8px;">YOUR 6-DIGIT OTP</div>
          <div style="font-size: 44px; font-weight: 900; letter-spacing: 14px; color: #ffffff; font-family: 'Courier New', Courier, monospace; text-shadow: 0 2px 16px rgba(245, 158, 11, 0.5);">${otp.split('').join(' ')}</div>
        </td>
      </tr>
    </table>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px;">
          <div style="color: #f59e0b; font-size: 13px; font-weight: 800; margin-bottom: 4px;">⏱️ Code Expires in 5 Minutes</div>
          <div style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
            Do not share this OTP code with anyone. AMIN support will never ask for your verification code.
          </div>
        </td>
      </tr>
    </table>

    <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
      If you did not request this email, please ignore this message or contact our luxury concierge immediately.
    </p>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `Your AMIN verification code is ${otp}. Valid for 5 minutes.`,
    badge: 'AMIN & PRAO PARIS',
    title: 'Verification Code Required',
    contentHtml,
  });

  return { html, text, subject };
}

// ─── 2. VIP Member Welcome & Onboarding Template ────────────────────────────
export function getWelcomeEmailTemplate(name: string, email: string): { html: string; text: string; subject: string } {
  const FRONTEND_URL = getFrontendUrl();
  const displayName = name || email.split('@')[0] || 'Valued Connoisseur';
  const subject = `✨ Welcome to AMIN Luxury Atelier, ${displayName}!`;
  const text = `Welcome to AMIN Luxury Atelier, ${displayName}!\n\nWe are delighted to welcome you to our exclusive circle of fine jewellery and haute cosmetics.\n\nYour Exclusive Privileges:\n- 100% BIS Hallmarked Certified Gold & Lab-Grown Diamonds\n- PRAO Paris Lifetime Anti-Tarnish Guarantee (Waterproof & Sweatproof)\n- Free Insured Armored Shipping across India\n- 14-Day Compliment Exchange Policy\n\nExplore Collections: ${FRONTEND_URL}/shop`;

  const contentHtml = `
    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
      We are delighted to welcome you into our luxury circle. At <strong>AMIN</strong>, we bring together timeless craftsmanship, <strong>BIS Hallmarked Fine Gold & Diamonds</strong>, and revolutionary <strong>PRAO Paris Anti-Tarnish</strong> everyday luxury pieces.
    </p>

    <!-- Privileges Grid -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
      <tr>
        <td style="padding: 20px 24px; border-bottom: 1px solid #1e293b;">
          <strong style="color: #f59e0b; font-size: 14px; display: block; margin-bottom: 4px;">🏆 100% BIS Hallmarked Pure Gold</strong>
          <span style="color: #94a3b8; font-size: 12px; line-height: 1.5;">Every gold and diamond masterpiece comes with government-accredited certification and authenticity guarantees.</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 24px; border-bottom: 1px solid #1e293b;">
          <strong style="color: #f59e0b; font-size: 14px; display: block; margin-bottom: 4px;">✨ PRAO Paris Lifetime Anti-Tarnish</strong>
          <span style="color: #94a3b8; font-size: 12px; line-height: 1.5;">Proprietary 18K micro-plating provides 100% sweat-proof, waterproof, and perfume-resistant everyday elegance.</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 24px;">
          <strong style="color: #f59e0b; font-size: 14px; display: block; margin-bottom: 4px;">🚚 Insured Armored Express Delivery</strong>
          <span style="color: #94a3b8; font-size: 12px; line-height: 1.5;">Every shipment travels in tamper-evident armored packaging with transit insurance straight to your doorstep.</span>
        </td>
      </tr>
    </table>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `Welcome to the AMIN circle, ${displayName}. Explore BIS Hallmarked Jewellery and PRAO Anti-Tarnish Collections.`,
    badge: 'VIP ATELIER ACCESS',
    title: `Welcome, ${displayName}! ✨`,
    subtitle: 'Your membership to India’s premier luxury fine jewellery and skincare destination is now active.',
    contentHtml,
    ctaText: 'Explore Collections',
    ctaUrl: `${FRONTEND_URL}/shop`,
    secondaryCtaText: 'Discover Our Atelier Story',
    secondaryCtaUrl: `${FRONTEND_URL}/about`,
  });

  return { html, text, subject };
}

// ─── 3. Order Placed & Confirmation Receipt ─────────────────────────────────
export function getOrderPlacedEmailTemplate(order: any, userEmail: string): { html: string; text: string; subject: string } {
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
  const text = `Thank you for your AMIN order #${orderId}!\nTotal Amount: ₹${total}\nPayment Status: ${order.paymentStatus || 'Pending'}\n\nTrack your order: ${FRONTEND_URL}/account/orders`;

  const itemsHtml = items.map((item: any) => {
    const pName = item.product?.name || item.name || 'AMIN Luxury Creation';
    const price = Number(item.price || item.variant?.price || 0).toLocaleString('en-IN');
    const qty = item.quantity || 1;
    const sku = item.sku || item.variant?.sku || '';
    const imgUrl = item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200';

    return `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #1e293b;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="60" style="vertical-align: top; padding-right: 14px;">
                <img src="${imgUrl}" alt="${pName}" width="54" height="54" style="border-radius: 8px; object-fit: cover; border: 1px solid #334155; display: block;" />
              </td>
              <td style="vertical-align: middle;">
                <div style="color: #f8fafc; font-size: 14px; font-weight: 700; line-height: 1.4;">${pName}</div>
                ${sku ? `<div style="color: #64748b; font-size: 11px; margin-top: 2px;">SKU: ${sku}</div>` : ''}
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 14px 8px; border-bottom: 1px solid #1e293b; color: #cbd5e1; font-size: 13px; text-align: center; vertical-align: middle;">
          &times;${qty}
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid #1e293b; color: #f59e0b; font-size: 14px; font-weight: 800; text-align: right; vertical-align: middle;">
          ₹${price}
        </td>
      </tr>
    `;
  }).join('');

  const contentHtml = `
    <!-- Status Banner -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td align="center" style="padding: 16px;">
          <span style="color: #4ade80; font-size: 16px; font-weight: 800; display: block; margin-bottom: 2px;">🎉 Order Successfully Confirmed</span>
          <span style="color: #94a3b8; font-size: 12px;">Order reference: <strong style="color: #f8fafc;">#${orderId}</strong> &bull; Payment: <strong style="color: #f59e0b; text-transform: uppercase;">${order.paymentMethod || 'Card'}</strong></span>
        </td>
      </tr>
    </table>

    <!-- Line Items Table -->
    <h3 style="color: #f8fafc; font-size: 15px; font-weight: 800; margin: 0 0 12px 0; font-family: Georgia, serif; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
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

    <!-- Price Calculation Breakdown -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 24px; padding: 18px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="color: #94a3b8; font-size: 13px; padding-bottom: 6px;">Subtotal</td>
              <td style="color: #f8fafc; font-size: 13px; font-weight: 700; text-align: right; padding-bottom: 6px;">₹${subtotal}</td>
            </tr>
            ${order.discount ? `
            <tr>
              <td style="color: #4ade80; font-size: 13px; padding-bottom: 6px;">Coupon Discount (${order.couponCode || 'APPLIED'})</td>
              <td style="color: #4ade80; font-size: 13px; font-weight: 700; text-align: right; padding-bottom: 6px;">-₹${discount}</td>
            </tr>` : ''}
            <tr>
              <td style="color: #94a3b8; font-size: 13px; padding-bottom: 6px;">GST / Luxury Tax (5%)</td>
              <td style="color: #f8fafc; font-size: 13px; font-weight: 700; text-align: right; padding-bottom: 6px;">₹${tax}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 13px; padding-bottom: 10px;">Insured Armored Shipping</td>
              <td style="color: #4ade80; font-size: 13px; font-weight: 700; text-align: right; padding-bottom: 10px;">${shipping}</td>
            </tr>
            <tr>
              <td style="border-top: 1px solid #334155; color: #ffffff; font-size: 16px; font-weight: 900; padding-top: 10px;">Total Paid</td>
              <td style="border-top: 1px solid #334155; color: #f59e0b; font-size: 18px; font-weight: 900; text-align: right; padding-top: 10px;">₹${total}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Shipping Address Box -->
    ${address.street || address.addressLine1 ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="color: #f59e0b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">📦 Shipping Destination</div>
          <div style="color: #f8fafc; font-size: 14px; font-weight: 700; margin-bottom: 2px;">${address.fullName || address.name || userEmail}</div>
          <div style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
            ${address.street || address.addressLine1 || ''}, ${address.city || ''}, ${address.state || ''} - ${address.postalCode || address.zip || ''}<br/>
            ${address.phone ? `Phone: ${address.phone}` : ''}
          </div>
        </td>
      </tr>
    </table>` : ''}
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `Your AMIN order #${orderId} is confirmed! Total: ₹${total}. View receipt and delivery tracking.`,
    badge: 'ORDER CONFIRMATION',
    title: 'Order Confirmed',
    subtitle: 'Thank you for choosing AMIN Luxury. Our artisans are now preparing your handcrafted pieces.',
    contentHtml,
    ctaText: 'Track Order Status',
    ctaUrl: `${FRONTEND_URL}/account/orders`,
    secondaryCtaText: 'Need Assistance? Contact Concierge',
    secondaryCtaUrl: `${FRONTEND_URL}/contact`,
  });

  return { html, text, subject };
}

// ─── 4. Order Status Update & Visual Progress Tracker ───────────────────────
export function getOrderStatusEmailTemplate(
  order: any,
  newStatus: string,
  userEmail: string,
  trackingInfo?: { courier?: string; trackingNumber?: string; estimatedDate?: string }
): { html: string; text: string; subject: string } {
  const FRONTEND_URL = getFrontendUrl();
  const orderId = order.orderNumber || order._id || order.id || `ORD-${Date.now()}`;
  const total = Number(order.total || 0).toLocaleString('en-IN');
  const normalized = (newStatus || 'processing').toLowerCase();

  const statusConfig: Record<string, { title: string; color: string; bg: string; icon: string; desc: string; step: number }> = {
    pending: { title: 'Order Received', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: '⏳', desc: 'Your order has been logged into our atelier queue.', step: 1 },
    processing: { title: 'Crafting & Hallmarking', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', icon: '🛠️', desc: 'Our artisans are inspecting, hallmarking, and packing your luxury pieces.', step: 2 },
    shipped: { title: 'Dispatched in Armored Transit', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', icon: '🚚', desc: 'Your package is in transit with our secure armored courier service.', step: 3 },
    delivered: { title: 'Delivered to Destination', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', icon: '🎁', desc: 'Your package has been successfully delivered. We hope you cherish your AMIN creations.', step: 4 },
    cancelled: { title: 'Order Cancelled', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', icon: '❌', desc: 'Your order has been cancelled. Any pre-paid amount has been initiated for refund.', step: 0 },
  };

  const current = statusConfig[normalized] || {
    title: `Order Updated: ${newStatus.toUpperCase()}`,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    icon: '📦',
    desc: `Your order status is now ${newStatus}.`,
    step: 2,
  };

  const subject = `📦 Order #${orderId} Status Update: ${current.title}`;
  const text = `Order #${orderId} Update: ${current.title}\n${current.desc}\nTotal: ₹${total}\n\nTrack real-time updates: ${FRONTEND_URL}/account/orders`;

  // Step Progress Timeline
  const steps = [
    { label: 'Placed', num: 1 },
    { label: 'Crafting', num: 2 },
    { label: 'Shipped', num: 3 },
    { label: 'Delivered', num: 4 },
  ];

  const timelineHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 28px 0;">
      <tr>
        ${steps.map((s) => {
          const isDone = current.step >= s.num && current.step !== 0;
          const isCurrent = current.step === s.num;
          const circleColor = isDone ? '#f59e0b' : '#334155';
          const textColor = isCurrent ? '#f59e0b' : isDone ? '#ffffff' : '#64748b';
          const fontWeight = isCurrent ? '800' : '600';

          return `
            <td align="center" style="width: 25%; vertical-align: top;">
              <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: ${isDone ? '#f59e0b' : '#1e293b'}; border: 2px solid ${circleColor}; color: ${isDone ? '#020617' : '#64748b'}; font-weight: 900; font-size: 13px; line-height: 28px; margin: 0 auto 6px auto;">
                ${isDone && s.num < current.step ? '✓' : s.num}
              </div>
              <span style="font-size: 11px; text-transform: uppercase; color: ${textColor}; font-weight: ${fontWeight}; letter-spacing: 0.5px;">
                ${s.label}
              </span>
            </td>
          `;
        }).join('')}
      </tr>
    </table>
  `;

  const contentHtml = `
    <!-- Highlight Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${current.bg}; border: 1px solid ${current.color}; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td align="center" style="padding: 24px 20px;">
          <div style="font-size: 38px; margin-bottom: 8px;">${current.icon}</div>
          <h3 style="color: ${current.color}; font-size: 20px; font-weight: 900; margin: 0 0 6px 0;">${current.title}</h3>
          <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin: 0;">${current.desc}</p>
        </td>
      </tr>
    </table>

    ${current.step > 0 ? timelineHtml : ''}

    <!-- Tracking Details (if present) -->
    ${trackingInfo?.trackingNumber ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="color: #f59e0b; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">🚚 Live Courier Tracking Details</div>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="color: #94a3b8; font-size: 13px; padding-bottom: 4px;">Courier Partner:</td>
              <td style="color: #f8fafc; font-size: 13px; font-weight: 700; text-align: right; padding-bottom: 4px;">${trackingInfo.courier || 'BlueDart Express'}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 13px; padding-bottom: 4px;">AWB / Tracking #:</td>
              <td style="color: #f59e0b; font-size: 13px; font-weight: 800; text-align: right; font-family: monospace; padding-bottom: 4px;">${trackingInfo.trackingNumber}</td>
            </tr>
            ${trackingInfo.estimatedDate ? `
            <tr>
              <td style="color: #94a3b8; font-size: 13px;">Estimated Arrival:</td>
              <td style="color: #4ade80; font-size: 13px; font-weight: 700; text-align: right;">${trackingInfo.estimatedDate}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>` : ''}

    <!-- Order Mini Summary -->
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
    badge: 'LIVE ORDER STATUS',
    title: 'Order Status Update',
    subtitle: `Real-time milestone progression for your AMIN order #${orderId}.`,
    contentHtml,
    ctaText: 'View Order in Account',
    ctaUrl: `${FRONTEND_URL}/account/orders`,
  });

  return { html, text, subject };
}

// ─── 5. Password Reset & Account Security Template ──────────────────────────
export function getPasswordResetEmailTemplate(resetUrl: string, name?: string): { html: string; text: string; subject: string } {
  const subject = `🔑 Reset Your AMIN Account Password`;
  const text = `Hello ${name || 'Member'},\n\nA password reset request was received for your AMIN account.\n\nClick the link below to set a new password:\n${resetUrl}\n\nThis link is valid for 15 minutes.\nIf you did not request this, please disregard this email.`;

  const contentHtml = `
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
      We received a request to reset the password for your AMIN account${name ? ` associated with <strong>${name}</strong>` : ''}. Click the button below to establish a new password:
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px;">
          <div style="color: #f59e0b; font-size: 13px; font-weight: 800; margin-bottom: 4px;">⏱️ Link Valid for 15 Minutes</div>
          <div style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
            For your protection, this single-use password reset link will expire in 15 minutes. If it expires, simply submit a new request.
          </div>
        </td>
      </tr>
    </table>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: 'Reset your AMIN account password securely. Link expires in 15 minutes.',
    badge: 'ACCOUNT SECURITY',
    title: 'Password Reset Request',
    subtitle: 'Follow the secure link below to reset your AMIN credentials.',
    contentHtml,
    ctaText: 'Reset Password',
    ctaUrl: resetUrl,
    footerNote: 'If you did not request a password reset, your credentials remain secure and you can ignore this notice.',
  });

  return { html, text, subject };
}

// ─── 6. Low Stock Inventory Alert (Admin) ───────────────────────────────────
export function getLowStockAlertEmailTemplate(productName: string, sku: string, currentStock: number): { html: string; text: string; subject: string } {
  const FRONTEND_URL = getFrontendUrl();
  const subject = `⚠️ Low Stock Alert: "${productName}" (SKU: ${sku}) — ${currentStock} remaining`;
  const text = `AMIN Inventory Alert: Product "${productName}" (SKU: ${sku}) has fallen below threshold with only ${currentStock} units left in stock.\n\nRestock now: ${FRONTEND_URL}/admin/products`;

  const contentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; border-radius: 14px; margin-bottom: 24px; padding: 20px;">
      <tr>
        <td>
          <div style="color: #f59e0b; font-size: 16px; font-weight: 900; margin-bottom: 8px;">⚠️ Immediate Restock Attention Required</div>
          <div style="color: #f8fafc; font-size: 14px; font-weight: 700;">${productName}</div>
          <div style="color: #cbd5e1; font-size: 13px; margin-top: 4px;">SKU: <strong style="font-family: monospace; color: #f59e0b;">${sku}</strong> &bull; Current Stock: <strong style="color: #f43f5e;">${currentStock} units</strong></div>
        </td>
      </tr>
    </table>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `Inventory Alert: ${productName} (SKU: ${sku}) is down to ${currentStock} units.`,
    badge: 'ADMIN INVENTORY ALERT',
    title: 'Low Stock Notification',
    subtitle: 'An automated catalog trigger detected inventory falling below safety levels.',
    contentHtml,
    ctaText: 'Manage Inventory in Admin',
    ctaUrl: `${FRONTEND_URL}/admin/products`,
  });

  return { html, text, subject };
}

// ─── 7. Support Inquiry / Concierge Confirmation ─────────────────────────────
export function getSupportInquiryEmailTemplate(ticketId: string, name: string, inquiryText: string): { html: string; text: string; subject: string } {
  const subject = `💬 We Received Your Inquiry [Ticket #${ticketId}] — AMIN Concierge`;
  const text = `Hello ${name},\n\nThank you for reaching out to the AMIN Luxury Concierge. Your inquiry #${ticketId} has been assigned to our senior specialists.\n\nYour message:\n"${inquiryText}"\n\nWe typically respond within 2-4 business hours.`;

  const contentHtml = `
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
      Dear ${name}, thank you for contacting the AMIN Luxury Concierge. Our bespoke jewelry and cosmetics specialists have received your inquiry.
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141c2e; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 24px; padding: 20px;">
      <tr>
        <td>
          <div style="color: #f59e0b; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">Ticket Reference: #${ticketId}</div>
          <div style="color: #94a3b8; font-size: 13px; font-style: italic; border-left: 3px solid #f59e0b; padding-left: 12px;">
            "${inquiryText}"
          </div>
        </td>
      </tr>
    </table>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `We have received your concierge request #${ticketId}. A specialist will respond shortly.`,
    badge: 'CONCIERGE DESK',
    title: 'Inquiry Received',
    subtitle: 'Our dedicated luxury concierge team is reviewing your message.',
    contentHtml,
  });

  return { html, text, subject };
}

// ─── 8. Newsletter / VIP Circle Access ───────────────────────────────────────
export function getNewsletterWelcomeEmailTemplate(email: string, voucherCode = 'AMIN10'): { html: string; text: string; subject: string } {
  const FRONTEND_URL = getFrontendUrl();
  const subject = `👑 Welcome to the AMIN Circle — Your 10% VIP Privilege Code`;
  const text = `Welcome to the AMIN Circle!\n\nUse code "${voucherCode}" at checkout to enjoy 10% off your first fine jewellery or cosmetics order.\n\nExplore Collections: ${FRONTEND_URL}/shop`;

  const contentHtml = `
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
      You are now part of our private inner circle. As our gift, enjoy an exclusive <strong>10% privilege discount</strong> on your next purchase:
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="center" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(244, 63, 94, 0.12) 100%); border: 2px dashed #f59e0b; border-radius: 14px; padding: 20px;">
          <div style="color: #f59e0b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">YOUR VIP VOUCHER CODE</div>
          <div style="color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 6px; font-family: monospace;">${voucherCode}</div>
          <div style="color: #94a3b8; font-size: 12px; margin-top: 6px;">Apply at checkout on any fine jewellery or skincare creation.</div>
        </td>
      </tr>
    </table>
  `;

  const html = renderLuxuryEmailLayout({
    preheader: `Your VIP code ${voucherCode} is ready! Enjoy 10% off fine jewellery and cosmetics.`,
    badge: 'PRIVATE CIRCLE',
    title: 'Welcome to the AMIN Circle',
    subtitle: 'Exclusive preview privileges, seasonal trunk shows, and bespoke offers await.',
    contentHtml,
    ctaText: 'Shop New Arrivals',
    ctaUrl: `${FRONTEND_URL}/shop`,
  });

  return { html, text, subject };
}
