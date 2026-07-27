import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy-load db helpers
let _dbModule: any = null;
async function getDb() {
  if (!_dbModule) _dbModule = await import('@/lib/db');
  return _dbModule;
}

// ── Authorize.net Sandbox ─────────────────────────────────────────────────────
const AUTHNET_API_LOGIN_ID = process.env.AUTHORIZENET_API_LOGIN_ID || '5KP3u95bQpv';
const AUTHNET_TRANSACTION_KEY = process.env.AUTHORIZENET_TRANSACTION_KEY || '346HZ32z3fP4hTG2';
const AUTHNET_ENDPOINT = 'https://apitest.authorize.net/xml/v1/request.api';

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
    return await verifyAccess(auth.slice(7));
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
        order: { description: opts.description || 'Sanab luxury purchase' },
        billTo: { firstName: opts.firstName, lastName: opts.lastName, email: opts.email || '', country: 'IN' },
      },
    },
  };
  const res = await fetch(AUTHNET_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  const json = JSON.parse(text.replace(/^\uFEFF/, ''));
  const txRes = json.transactionResponse;
  if (!txRes || txRes.responseCode !== '1') {
    const errMsg = txRes?.errors?.[0]?.errorText || txRes?.messages?.[0]?.description || 'Card payment declined';
    throw new Error(errMsg);
  }
  return { transactionId: txRes.transId, authCode: txRes.authCode, accountNumber: txRes.accountNumber, message: txRes.messages?.[0]?.description || 'Approved' };
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

  // ── PUBLIC AUTH ───────────────────────────────────────────────────────────
  // POST /api/public/auth/otp/send
  if (route === 'public/auth/otp/send' && method === 'POST') {
    try {
      const body = await req.json();
      const email = (body.email || '').toLowerCase().trim();
      if (!email) return err('Email required');
      const { User } = await getModels();
      const user = await User.findByEmail(email);
      if (!user) return err('No account found with this email address', 404);
      return ok({ message: 'OTP sent (use your password as OTP in this demo)' });
    } catch (e: any) { return err(e.message, 500); }
  }

  // POST /api/public/auth/otp/verify
  if (route === 'public/auth/otp/verify' && method === 'POST') {
    try {
      const body = await req.json();
      const email = (body.email || '').toLowerCase().trim();
      const otp = body.otp || '';
      if (!email || !otp) return err('Email and OTP required');
      const { User } = await getModels();
      const user = await User.findByEmail(email);
      if (!user) return err('Invalid email or password. Please try again.', 401);
      if (!user.isActive) return err('Account is deactivated', 401);
      const valid = await bcrypt.compare(otp, user.password);
      if (!valid) return err('Invalid email or password. Please try again.', 401);
      const payload = { id: user._id, email: user.email, role: user.role, name: user.name };
      const [accessToken, refreshToken] = await Promise.all([signAccess(payload), signRefresh(payload)]);
      return ok({ user: { _id: user._id, id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
    } catch (e: any) { return err(e.message, 500); }
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
      const data = await Order.listByUser(
        currentUser.id,
        parseInt(searchParams.get('page') || '1'),
        parseInt(searchParams.get('limit') || '10')
      );
      return ok({ results: data.results, totalResults: data.total, totalPages: data.totalPages });
    } catch (e: any) { return err(e.message, 500); }
  }

  // POST /api/orders (create order)
  if (route === 'orders' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser) return err('Authentication required', 401);
    try {
      const body = await req.json();
      const { Order } = await getModels();
      const order = await Order.create({
        ...body,
        userId: currentUser.id,
        userEmail: currentUser.email,
      });
      return ok(order, 201);
    } catch (e: any) { return err(e.message, 500); }
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
      if (currentUser.role !== 'admin' && order.userId !== currentUser.id) return err('Access denied', 403);
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

  // ── IMAGE UPLOAD ──────────────────────────────────────────────────────────
  if (route === 'upload' && method === 'POST') {
    const currentUser = await getUser(req);
    if (!currentUser || currentUser.role !== 'admin') return err('Admin access required', 403);
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) return err('No file provided');
      const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'ddwrdkpkv';
      const API_KEY = process.env.CLOUDINARY_API_KEY || '283771221969341';
      const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'Gp1ngeDJTKuP6sDsewz-cDOwflc';
      const timestamp = Math.round(Date.now() / 1000);
      const crypto = await import('crypto');
      const signature = crypto.createHash('sha1').update(`timestamp=${timestamp}${API_SECRET}`).digest('hex');
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('api_key', API_KEY);
      uploadForm.append('timestamp', timestamp.toString());
      uploadForm.append('signature', signature);
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST', body: uploadForm,
      });
      const uploadData = await uploadRes.json();
      if (uploadData.error) return err(uploadData.error.message || 'Upload failed');
      return ok({ url: uploadData.secure_url, publicId: uploadData.public_id });
    } catch (e: any) { return err(e.message, 500); }
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

  // ── COUPONS (stub) ────────────────────────────────────────────────────────
  if (route === 'coupons/validate' && method === 'POST') {
    return ok({ valid: false, message: 'No active coupons available' });
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
