import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Transactional Email Templates (R3) ───────────────────────────────────────
function buildOtpHtml(otp: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:32px 24px;background-color:#0f172a;color:#ffffff;border-radius:16px;max-width:520px;margin:0 auto;border:1px solid #334155">
    <div style="text-align:center;padding-bottom:20px;border-bottom:1px solid #1e293b;margin-bottom:24px">
      <span style="color:#f59e0b;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:3px">✨ AMIN LUXURY ATELIER</span>
      <h2 style="color:#ffffff;font-size:26px;font-weight:900;margin:6px 0 0 0;font-family:Georgia,serif">AMIN</h2>
    </div>
    <h3 style="color:#f8fafc;font-size:18px;font-weight:700;margin-top:0;margin-bottom:8px">Security Verification Code</h3>
    <p style="font-size:14px;color:#cbd5e1;line-height:1.6;margin-top:0;margin-bottom:20px">Use the 6-digit code below to verify your sign-in to AMIN Luxury Atelier. Valid for <strong>5 minutes</strong>.</p>
    <div style="background:linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%);border:2px dashed #f59e0b;padding:22px;font-size:38px;font-weight:900;letter-spacing:10px;color:#ffffff;text-align:center;margin:24px 0;border-radius:14px;font-family:monospace;text-shadow:0 2px 10px rgba(245, 158, 11, 0.4)">${otp}</div>
    <p style="font-size:12px;color:#64748b;margin-bottom:0;text-align:center">If you didn't request this verification code, please ignore this email.</p>
  </div>`;
}

function buildWelcomeHtml(name: string): string {
  const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://temp-sanab.vercel.app';
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:32px 24px;background-color:#0f172a;color:#ffffff;border-radius:16px;max-width:540px;margin:0 auto;border:1px solid #334155">
    <div style="text-align:center;padding-bottom:20px;border-bottom:1px solid #1e293b;margin-bottom:24px">
      <span style="color:#f59e0b;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:3px">✨ AMIN LUXURY ATELIER</span>
      <h2 style="color:#ffffff;font-size:28px;font-weight:900;margin:6px 0 0 0;font-family:Georgia,serif">Welcome to AMIN</h2>
    </div>
    <h3 style="color:#f59e0b;font-size:22px;font-weight:800;margin-top:0;margin-bottom:12px">Welcome, ${name}! ✨</h3>
    <p style="font-size:14px;color:#cbd5e1;line-height:1.6;margin-top:0;margin-bottom:24px">We are thrilled to welcome you to our luxury circle. Explore our handcrafted <strong>BIS Hallmarked Fine Jewellery</strong>, revolutionary <strong>Anti-Tarnish Collection</strong>, and premium cosmetics.</p>
    <div style="background-color:#1e293b;border-left:4px solid #f59e0b;border-radius:0 12px 12px 0;padding:20px;margin-bottom:28px">
      <h4 style="color:#ffffff;font-size:15px;font-weight:700;margin:0 0 8px 0">Your Privileges Include:</h4>
      <ul style="color:#94a3b8;font-size:13px;line-height:1.8;margin:0;padding-left:20px">
        <li><strong>✨ Lifetime Anti-Tarnish Guarantee:</strong> Waterproof & sweat-proof everyday wear.</li>
        <li><strong>🏆 Certified Gold & Diamonds:</strong> 100% BIS Hallmarked.</li>
        <li><strong>🚚 Express Delivery:</strong> Insured shipping across India.</li>
      </ul>
    </div>
    <div style="text-align:center;margin:28px 0">
      <a href="${FRONTEND_URL}/shop" style="background:linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%);color:#020617;font-size:15px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:9999px;display:inline-block">Explore Collections →</a>
    </div>
  </div>`;
}

async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const html = buildWelcomeHtml(name);
  const subject = `Welcome to AMIN Luxury Atelier, ${name}! ✨`;
  if (resendKey && resendKey.startsWith('re_')) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'AMIN Luxury Atelier <onboarding@resend.dev>', to: [to], subject, html }),
      });
      console.log(`[RESEND] ✅ Welcome email sent to ${to}`);
      return;
    } catch (e: any) { console.warn('[RESEND] Welcome email error:', e?.message); }
  }
  try {
    const smtpUser = process.env.SMTP_USER || process.env.MAIL_USERNAME || '';
    const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD || '';
    if (!smtpUser || !smtpPass) return;
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: smtpUser, pass: smtpPass }, tls: { rejectUnauthorized: false }
    });
    await transporter.sendMail({ from: `"AMIN Luxury Atelier" <${smtpUser}>`, to, subject, html });
    console.log(`[GMAIL SMTP] ✅ Welcome email sent to ${to}`);
  } catch (err: any) { console.error('[GMAIL SMTP] ❌ Failed welcome email:', err?.message); }
}

// ── Fast email sender: Resend HTTP API first, Gmail SMTP fallback ─────────────
async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const isResendConfigured = resendKey &&
    !resendKey.includes('REPLACE') &&
    !resendKey.includes('PLACEHOLDER') &&
    resendKey.startsWith('re_');

  const html = buildOtpHtml(otp);
  const subject = `${otp} — Your AMIN Verification Code`;

  // PRIMARY: Resend (instant HTTP call, no SMTP socket overhead)
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
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        console.log(`[RESEND] ✅ OTP email sent to ${to}`);
        return;
      }
      const errBody = await res.text();
      console.warn(`[RESEND] Failed (${res.status}): ${errBody}`);
    } catch (e: any) {
      console.warn('[RESEND] Error:', e?.message);
    }
  }

  // FALLBACK: Gmail SMTP (Nodemailer)
  // IMPORTANT: Must be awaited — Vercel terminates the serverless function
  // immediately after returning a response, so fire-and-forget does NOT work.
  try {
    const smtpUser = process.env.SMTP_USER || process.env.MAIL_USERNAME || '';
    const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD || '';

    if (!smtpUser || !smtpPass) {
      console.error('[GMAIL SMTP] SMTP credentials not configured. Email not sent.');
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
    });
    console.log(`[GMAIL SMTP] ✅ OTP email sent to ${to}`);
  } catch (err: any) {
    console.error('[GMAIL SMTP] ❌ Failed to send OTP email:', err?.message || err);
  }
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
    return ok({ message: '🚀 Sanab API Health OK', version: 'pg-1.0.0', timestamp: new Date().toISOString() });
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
          role: 'user',
        });
        // Send welcome email on first account creation (R4)
        await sendWelcomeEmail(email, formattedName);
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
      return ok({ results: data.results, products: data.results, totalResults: data.total, totalPages: data.totalPages });
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

  // ── 404 fallback ──────────────────────────────────────────────────────────
  return NextResponse.json({ success: false, message: `Route not found: ${method} /api/${route}` }, { status: 404 });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
