import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, Category, Product, Order, signAccess, signRefresh, verifyAccess, bcrypt } from '@/lib/db';
import mongoose from 'mongoose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ── Auth helper ───────────────────────────────────────────────────────────────
function getUser(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    return verifyAccess(auth.slice(7));
  } catch { return null; }
}

function ok(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}
function err(msg: string, status = 400) {
  return NextResponse.json({ success: false, message: msg }, { status });
}

// ── Main handler ──────────────────────────────────────────────────────────────
async function handler(req: NextRequest, path: string[]) {
  const route = path.join('/');
  const method = req.method;
  let body: any = {};
  try { body = await req.json(); } catch {}

  await connectDB();

  // ── HEALTH ────────────────────────────────────────────────────────────────
  if (route === 'health' && method === 'GET') {
    return ok({
      message: '🚀 Sanab API running',
      env: process.env.NODE_ENV,
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      mongodb: process.env.MONGODB_URI ? 'configured' : 'missing',
      timestamp: new Date().toISOString(),
    });
  }

  // ── PUBLIC AUTH ───────────────────────────────────────────────────────────
  if (route === 'public/auth/login' && method === 'POST') {
    const { email, password } = body;
    if (!email || !password) return err('Email and password required');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return err('Invalid credentials', 401);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return err('Invalid credentials', 401);
    const payload = { id: user._id, email: user.email, role: user.role };
    return ok({ accessToken: signAccess(payload), refreshToken: signRefresh(payload), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  }

  if (route === 'public/auth/register' && method === 'POST') {
    const { name, email, password, phone } = body;
    if (!name || !email || !password) return err('Name, email and password required');
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return err('Email already registered', 409);
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, phone });
    const payload = { id: user._id, email: user.email, role: user.role };
    return ok({ accessToken: signAccess(payload), refreshToken: signRefresh(payload), user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 201);
  }

  // ── PUBLIC PRODUCTS ───────────────────────────────────────────────────────
  if (route === 'public/products' && method === 'GET') {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 20);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const query: any = { isActive: true };
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    if (featured === 'true') query.isFeatured = true;
    const [products, total] = await Promise.all([
      Product.find(query).populate('category', 'name slug').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(query)
    ]);
    return ok({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  }

  if (route.startsWith('public/products/') && method === 'GET') {
    const slug = path[path.length - 1];
    const product = await Product.findOne({ slug, isActive: true }).populate('category', 'name slug');
    if (!product) return err('Product not found', 404);
    return ok({ product });
  }

  // ── PUBLIC CATEGORIES ─────────────────────────────────────────────────────
  if (route === 'public/categories' && method === 'GET') {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return ok({ categories });
  }

  if (route.startsWith('public/categories/') && method === 'GET') {
    const slug = path[path.length - 1];
    const category = await Category.findOne({ slug, isActive: true });
    if (!category) return err('Category not found', 404);
    return ok({ category });
  }

  // ── ADMIN (requires auth + admin role) ───────────────────────────────────
  const user = getUser(req);
  const isAdmin = user?.role === 'admin';

  if (route === 'admin/products' && method === 'GET') {
    if (!isAdmin) return err('Unauthorized', 401);
    const page = Number(new URL(req.url).searchParams.get('page') || 1);
    const limit = Number(new URL(req.url).searchParams.get('limit') || 20);
    const [products, total] = await Promise.all([
      Product.find().populate('category', 'name slug').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments()
    ]);
    return ok({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  }

  if (route === 'admin/products' && method === 'POST') {
    if (!isAdmin) return err('Unauthorized', 401);
    const { name, description, price, sku, stock, category, images, salePrice, isFeatured, tags, attributes, shortDescription } = body;
    if (!name || !description || !price || !sku || !category) return err('Missing required fields');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const product = await Product.create({ name, slug, description, shortDescription, price, salePrice, sku, stock: stock || 0, category, images: images || [], isFeatured: isFeatured || false, tags: tags || [], attributes: attributes || [] });
    return ok({ product }, 201);
  }

  if (route.startsWith('admin/products/') && method === 'PUT') {
    if (!isAdmin) return err('Unauthorized', 401);
    const id = path[path.length - 1];
    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!product) return err('Product not found', 404);
    return ok({ product });
  }

  if (route.startsWith('admin/products/') && method === 'DELETE') {
    if (!isAdmin) return err('Unauthorized', 401);
    const id = path[path.length - 1];
    await Product.findByIdAndDelete(id);
    return ok({ message: 'Product deleted' });
  }

  if (route === 'admin/categories' && method === 'GET') {
    if (!isAdmin) return err('Unauthorized', 401);
    const categories = await Category.find().sort({ name: 1 });
    return ok({ categories });
  }

  if (route === 'admin/categories' && method === 'POST') {
    if (!isAdmin) return err('Unauthorized', 401);
    const { name, description, image, parentCategory } = body;
    if (!name) return err('Name is required');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const category = await Category.create({ name, slug, description, image, parentCategory });
    return ok({ category }, 201);
  }

  if (route === 'admin/orders' && method === 'GET') {
    if (!isAdmin) return err('Unauthorized', 401);
    const page = Number(new URL(req.url).searchParams.get('page') || 1);
    const limit = Number(new URL(req.url).searchParams.get('limit') || 20);
    const [orders, total] = await Promise.all([
      Order.find().populate('user', 'name email').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      Order.countDocuments()
    ]);
    return ok({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  }

  if (route === 'admin/seed' && method === 'POST') {
    if (!isAdmin) return err('Unauthorized', 401);
    // Seed admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'mdsadiqueamin721786@gmail.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'Sadique@123';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({ name: 'Admin', email: adminEmail, password: await bcrypt.hash(adminPass, 10), role: 'admin' });
    }
    return ok({ message: 'Seed complete' });
  }

  // ── USER PROFILE ──────────────────────────────────────────────────────────
  if (route === 'user/profile' && method === 'GET') {
    if (!user) return err('Unauthorized', 401);
    const profile = await User.findById(user.id).select('-password');
    if (!profile) return err('User not found', 404);
    return ok({ user: profile });
  }

  return NextResponse.json({ success: false, message: `Route not found: ${method} /api/${route}` }, { status: 404 });
}

// ── Route exports ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try { const { path } = await params; return await handler(req, path); }
  catch (e: any) { console.error('API Error:', e); return err(e.message || 'Internal server error', 500); }
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try { const { path } = await params; return await handler(req, path); }
  catch (e: any) { console.error('API Error:', e); return err(e.message || 'Internal server error', 500); }
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try { const { path } = await params; return await handler(req, path); }
  catch (e: any) { console.error('API Error:', e); return err(e.message || 'Internal server error', 500); }
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try { const { path } = await params; return await handler(req, path); }
  catch (e: any) { console.error('API Error:', e); return err(e.message || 'Internal server error', 500); }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try { const { path } = await params; return await handler(req, path); }
  catch (e: any) { console.error('API Error:', e); return err(e.message || 'Internal server error', 500); }
}
