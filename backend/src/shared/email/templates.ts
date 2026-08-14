/**
 * SANAB Luxury E-Commerce Email Templates
 * Premium HTML & CSS responsive templates for:
 * 1. OTP Verification Email
 * 2. Welcome Email
 * 3. Order Placed / Confirmation Email
 * 4. Order Status Update Email
 */

const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
  background-color: #0f172a;
  margin: 0;
  padding: 0;
  width: 100%;
`;

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://temp-sanab.vercel.app';

const BRAND_HEADER = `
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #451a03 100%); padding: 36px 24px; text-align: center; border-bottom: 2px solid #f59e0b;">
    <div style="display: inline-block; padding: 8px 16px; border-radius: 9999px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); margin-bottom: 12px;">
      <span style="color: #f59e0b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px;">✨ AMIN LUXURY ATELIER</span>
    </div>
    <h1 style="color: #ffffff; font-size: 32px; font-weight: 900; margin: 0; font-family: Georgia, serif; letter-spacing: -0.5px;">AMIN</h1>
    <p style="color: #cbd5e1; font-size: 13px; margin: 6px 0 0 0; letter-spacing: 1px;">FINE JEWELLERY • ANTI-TARNISH • COSMETICS</p>
  </div>
`;

const BRAND_FOOTER = `
  <div style="background-color: #020617; padding: 28px 24px; text-align: center; border-top: 1px solid #334155; color: #64748b; font-size: 12px;">
    <p style="margin: 0 0 8px 0; color: #94a3b8; font-weight: 600;">AMIN Luxury E-Commerce Platform</p>
    <p style="margin: 0 0 12px 0;">100% BIS Hallmarked Gold • Anti-Tarnish Lifetime Guarantee • Express Delivery</p>
    <div style="margin: 16px 0; border-top: 1px dashed #334155; padding-top: 16px;">
      <a href="${FRONTEND_URL}/shop" style="color: #f59e0b; text-decoration: none; font-weight: 700; margin: 0 12px;">Collections</a> •
      <a href="${FRONTEND_URL}/about" style="color: #f59e0b; text-decoration: none; font-weight: 700; margin: 0 12px;">About Atelier</a> •
      <a href="${FRONTEND_URL}/contact" style="color: #f59e0b; text-decoration: none; font-weight: 700; margin: 0 12px;">Concierge Support</a>
    </div>
    <p style="margin: 0; font-size: 11px; color: #475569;">&copy; ${new Date().getFullYear()} AMIN Platform. All rights reserved. Confidential transaction communication.</p>
  </div>
`;

// ─── 1. OTP Verification Code Template ──────────────────────────────────────
export function getOtpEmailTemplate(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="${BASE_STYLES}">
      <div style="max-width: 600px; margin: 24px auto; background-color: #0f172a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); border: 1px solid #334155;">
        ${BRAND_HEADER}
        <div style="padding: 36px 32px; background: radial-gradient(circle at top right, rgba(245, 158, 11, 0.08), transparent 70%);">
          <h2 style="color: #f8fafc; font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 8px; font-family: Georgia, serif;">Verification Code Required</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
            Enter the 6-digit verification code below to sign in or confirm your security authorization on SANAB.
          </p>

          <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%); border: 2px dashed #f59e0b; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; tracking: 2px; color: #f59e0b; display: block; margin-bottom: 8px;">YOUR 6-DIGIT OTP</span>
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #ffffff; font-family: monospace; text-shadow: 0 2px 10px rgba(245, 158, 11, 0.4);">${otp}</span>
          </div>

          <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="color: #f59e0b; font-size: 13px; font-weight: 700; margin: 0 0 4px 0;">⏱️ Code Expires in 5 Minutes</p>
            <p style="color: #64748b; font-size: 12px; margin: 0;">Do not share this OTP code with anyone. SANAB support will never ask for your verification code.</p>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
            If you did not request this email, please ignore this message or contact our luxury concierge immediately.
          </p>
        </div>
        ${BRAND_FOOTER}
      </div>
    </body>
    </html>
  `;
}

// ─── 2. Welcome Email Template ──────────────────────────────────────────────
export function getWelcomeEmailTemplate(name: string, email: string): string {
  const displayName = name || email.split('@')[0] || 'Valued Member';
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="${BASE_STYLES}">
      <div style="max-width: 600px; margin: 24px auto; background-color: #0f172a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); border: 1px solid #334155;">
        ${BRAND_HEADER}
        <div style="padding: 40px 32px; background: radial-gradient(circle at top left, rgba(245, 158, 11, 0.12), transparent 70%);">
          <h2 style="color: #f59e0b; font-size: 26px; font-weight: 900; margin-top: 0; margin-bottom: 12px; font-family: Georgia, serif;">Welcome to SANAB, ${displayName}! ✨</h2>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            We are thrilled to welcome you to our luxury circle. Explore our handcrafted <strong>BIS Hallmarked Fine Jewellery</strong>, revolutionary <strong>PRAO Paris Anti-Tarnish 18K Gold Plated Collection</strong>, and dermatologically clinically-tested cosmetics.
          </p>

          <div style="background-color: #1e293b; border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 20px; margin-bottom: 28px;">
            <h3 style="color: #ffffff; font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">Your Exclusive Privileges Include:</h3>
            <ul style="color: #94a3b8; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>✨ Lifetime Anti-Tarnish Guarantee:</strong> Waterproof & sweat-proof everyday wear.</li>
              <li><strong>🏆 Certified Gold & Diamonds:</strong> 100% BIS Hallmarked with lab certificates.</li>
              <li><strong>🚚 Insured Armored Shipping:</strong> Free express delivery across India.</li>
              <li><strong>🔄 14-Day Easy Exchange:</strong> Hassle-free returns & replacements.</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="http://localhost:3000/shop" style="background: linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%); color: #020617; font-size: 15px; font-weight: 800; text-decoration: none; padding: 16px 36px; border-radius: 9999px; display: inline-block; box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4);">
              Explore Exclusive Collections →
            </a>
          </div>
        </div>
        ${BRAND_FOOTER}
      </div>
    </body>
    </html>
  `;
}

// ─── 3. Order Placed Confirmation Email Template ────────────────────────────
export function getOrderPlacedEmailTemplate(order: any, userEmail: string): string {
  const orderId = order._id || order.id || `SANAB-${Date.now()}`;
  const total = (order.total || 0).toLocaleString('en-IN');
  const subtotal = (order.subtotal || order.total || 0).toLocaleString('en-IN');
  const discount = (order.discount || 0).toLocaleString('en-IN');
  const items = Array.isArray(order.items) ? order.items : [];
  const address = order.shippingAddress || {};

  const itemsHtml = items.map((item: any) => {
    const pName = item.product?.name || item.name || 'SANAB Jewellery Item';
    const price = (item.variant?.price || item.price || 0).toLocaleString('en-IN');
    const qty = item.quantity || 1;
    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #334155; color: #f8fafc; font-size: 14px; font-weight: 600;">
          ${pName}
          ${item.variant?.sku ? `<br/><span style="font-size: 11px; color: #64748b;">SKU: ${item.variant.sku}</span>` : ''}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #334155; color: #cbd5e1; font-size: 13px; text-align: center;">×${qty}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #334155; color: #f59e0b; font-size: 14px; font-weight: 800; text-align: right;">₹${price}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="${BASE_STYLES}">
      <div style="max-width: 600px; margin: 24px auto; background-color: #0f172a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); border: 1px solid #334155;">
        ${BRAND_HEADER}
        <div style="padding: 36px 32px; background: radial-gradient(circle at top right, rgba(34, 197, 94, 0.1), transparent 70%);">
          <div style="background-color: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <span style="color: #4ade80; font-size: 18px; font-weight: 800; display: block;">🎉 Order Confirmed!</span>
            <span style="color: #94a3b8; font-size: 13px;">Thank you for shopping with SANAB. Your order is being processed.</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; color: #94a3b8; font-size: 13px;">
            <tr>
              <td>Order ID: <strong style="color: #f8fafc;">#${orderId}</strong></td>
              <td style="text-align: right;">Payment Method: <strong style="color: #f59e0b; text-transform: uppercase;">${order.paymentDetails?.method || 'Card/COD'}</strong></td>
            </tr>
          </table>

          <h3 style="color: #f8fafc; font-size: 16px; font-weight: 700; margin: 0 0 12px 0; font-family: Georgia, serif; border-bottom: 2px solid #f59e0b; padding-bottom: 6px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                <th style="padding-bottom: 8px; border-bottom: 1px solid #334155;">Item</th>
                <th style="padding-bottom: 8px; border-bottom: 1px solid #334155; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; border-bottom: 1px solid #334155; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="background-color: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; color: #94a3b8; font-size: 13px; margin-bottom: 6px;">
              <span>Subtotal:</span> <span style="color: #f8fafc; font-weight: 600;">₹${subtotal}</span>
            </div>
            ${order.discount ? `
              <div style="display: flex; justify-content: space-between; color: #4ade80; font-size: 13px; margin-bottom: 6px;">
                <span>Discount:</span> <span style="font-weight: 600;">-₹${discount}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; color: #94a3b8; font-size: 13px; margin-bottom: 10px;">
              <span>Insured Shipping:</span> <span style="color: #4ade80; font-weight: 600;">FREE</span>
            </div>
            <div style="border-top: 1px solid #334155; padding-top: 10px; display: flex; justify-content: space-between; color: #ffffff; font-size: 16px; font-weight: 900;">
              <span>Total Paid:</span> <span style="color: #f59e0b;">₹${total}</span>
            </div>
          </div>

          ${address.street ? `
            <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <h4 style="color: #f59e0b; font-size: 13px; font-weight: 700; margin: 0 0 6px 0; text-transform: uppercase;">Shipping Destination</h4>
              <p style="color: #f8fafc; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">${address.fullName || address.street}</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">${address.street}, ${address.city}, ${address.state} - ${address.postalCode}, ${address.country || 'India'}</p>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 28px;">
            <a href="http://localhost:3000/account/orders" style="background-color: #f59e0b; color: #020617; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 9999px; display: inline-block;">
              Track Order Status →
            </a>
          </div>
        </div>
        ${BRAND_FOOTER}
      </div>
    </body>
    </html>
  `;
}

// ─── 4. Order Status Update Email Template ──────────────────────────────────
export function getOrderStatusEmailTemplate(order: any, newStatus: string, userEmail: string): string {
  const orderId = order._id || order.id || `SANAB-${Date.now()}`;
  const total = (order.total || 0).toLocaleString('en-IN');

  const statusConfig: Record<string, { title: string; color: string; bg: string; icon: string; desc: string }> = {
    pending: { title: 'Order Received', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: '⏳', desc: 'Your order has been logged and is awaiting verification.' },
    processing: { title: 'Order Confirmed & In Atelier Processing', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', icon: '🛠️', desc: 'Our master craftsmen are preparing and hallmarking your jewellery items.' },
    shipped: { title: 'Order Dispatched & In Transit', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', icon: '🚚', desc: 'Your package has been handed to our armored insured courier service.' },
    delivered: { title: 'Order Delivered Successfully', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', icon: '🎉', desc: 'Your order has been delivered! We hope you love your SANAB items.' },
    cancelled: { title: 'Order Cancelled', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', icon: '❌', desc: 'Your order has been cancelled. Any processed payment will be refunded within 3-5 days.' },
  };

  const currentStatus = statusConfig[newStatus.toLowerCase()] || {
    title: `Order Status: ${newStatus.toUpperCase()}`,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    icon: '📦',
    desc: `Your order status has been updated to ${newStatus}.`,
  };

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="${BASE_STYLES}">
      <div style="max-width: 600px; margin: 24px auto; background-color: #0f172a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); border: 1px solid #334155;">
        ${BRAND_HEADER}
        <div style="padding: 36px 32px;">
          <div style="background-color: ${currentStatus.bg}; border: 1px solid ${currentStatus.color}; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px;">
            <span style="font-size: 36px; display: block; margin-bottom: 8px;">${currentStatus.icon}</span>
            <h2 style="color: ${currentStatus.color}; font-size: 20px; font-weight: 900; margin: 0 0 6px 0;">${currentStatus.title}</h2>
            <p style="color: #cbd5e1; font-size: 13px; margin: 0;">${currentStatus.desc}</p>
          </div>

          <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #64748b; padding-bottom: 8px;">Order Reference:</td>
                <td style="color: #f8fafc; font-weight: 700; text-align: right; padding-bottom: 8px;">#${orderId}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding-bottom: 8px;">Total Amount:</td>
                <td style="color: #f59e0b; font-weight: 800; text-align: right; padding-bottom: 8px;">₹${total}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Current Status:</td>
                <td style="color: ${currentStatus.color}; font-weight: 800; text-align: right; text-transform: uppercase;">${newStatus}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 28px;">
            <a href="http://localhost:3000/account/orders" style="background-color: #f59e0b; color: #020617; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 9999px; display: inline-block;">
              View Full Order History →
            </a>
          </div>
        </div>
        ${BRAND_FOOTER}
      </div>
    </body>
    </html>
  `;
}
