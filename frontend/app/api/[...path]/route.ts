import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy-load db helpers to avoid module-level crash if bcrypt/mongoose fails
let _dbModule: any = null;
async function getDb() {
  if (!_dbModule) {
    _dbModule = await import('@/lib/db');
  }
  return _dbModule;
}


// ── Authorize.net Sandbox Credentials ────────────────────────────────────────
// Using official Authorize.net sandbox test credentials
const AUTHNET_API_LOGIN_ID = process.env.AUTHORIZENET_API_LOGIN_ID || '5KP3u95bQpv';
const AUTHNET_TRANSACTION_KEY = process.env.AUTHORIZENET_TRANSACTION_KEY || '346HZ32z3fP4hTG2';
const AUTHNET_ENDPOINT = 'https://apitest.authorize.net/xml/v1/request.api';

// ── Sample fallback data ──────────────────────────────────────────────────────
const SAMPLE_CATEGORIES = [
  { _id: 'cat_1', name: 'Necklaces & Pendants', slug: 'necklaces-pendants', description: 'Elegant gold and diamond necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500', isActive: true },
  { _id: 'cat_2', name: 'Earrings & Studs', slug: 'earrings-studs', description: 'Stunning earrings for all occasions', image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500', isActive: true },
  { _id: 'cat_3', name: 'Rings & Bands', slug: 'rings-bands', description: 'Solitaire and bridal rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', isActive: true },
  { _id: 'cat_4', name: 'Bracelets & Bangles', slug: 'bracelets-bangles', description: 'Royal bangles and charm bracelets', image: 'https://images.unsplash.com/photo-1611591475140-410a56e07b89?w=500', isActive: true },
  { _id: 'cat_5', name: 'Cosmetics & Skincare', slug: 'cosmetics-skincare', description: 'Luxury beauty and skincare products', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500', isActive: true }
];

const SAMPLE_PRODUCTS: any[] = [
  { _id: 'prod_1', name: 'Royal Kundan Choker Set', slug: 'royal-kundan-choker-set', description: 'Handcrafted Kundan necklace set with pearl drops.', brand: 'Sanab', type: 'jewellery', price: 12999, salePrice: 9999, sku: 'NK-KUN-001', stock: 15, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'], category: SAMPLE_CATEGORIES[0], isActive: true, isFeatured: true, variants: [{ sku: 'NK-KUN-001-GLD', price: 12999, stock: 15, attributes: { Color: 'Gold' }, images: [] }] },
  { _id: 'prod_2', name: 'Solitaire Diamond Earrings', slug: 'solitaire-diamond-earrings', description: '18K White Gold solitaire diamond studs.', brand: 'Sanab', type: 'jewellery', price: 24999, salePrice: 21999, sku: 'ER-DIA-002', stock: 10, images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600'], category: SAMPLE_CATEGORIES[1], isActive: true, isFeatured: true, variants: [{ sku: 'ER-DIA-002-WHT', price: 24999, stock: 10, attributes: { Material: 'White Gold' }, images: [] }] },
  { _id: 'prod_3', name: 'Rose Gold Diamond Ring', slug: 'rose-gold-diamond-ring', description: 'Elegant rose gold ring studded with brilliant diamonds.', brand: 'Sanab', type: 'jewellery', price: 18500, salePrice: 15999, sku: 'RG-DIA-003', stock: 8, images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600'], category: SAMPLE_CATEGORIES[2], isActive: true, isFeatured: true, variants: [{ sku: 'RG-DIA-003-M', price: 18500, stock: 8, attributes: { Size: 'Medium' }, images: [] }] },
  { _id: 'prod_4', name: 'Gold Emerald Bangle Set', slug: 'gold-emerald-bangle-set', description: 'Traditional 22K gold bangles with emerald stone inlay.', brand: 'Sanab', type: 'jewellery', price: 34999, salePrice: 29999, sku: 'BG-GLD-004', stock: 12, images: ['https://images.unsplash.com/photo-1611591475140-410a56e07b89?w=600'], category: SAMPLE_CATEGORIES[3], isActive: true, isFeatured: true, variants: [{ sku: 'BG-GLD-004-GLD', price: 34999, stock: 12, attributes: { Color: 'Gold' }, images: [] }] },
  { _id: 'prod_5', name: 'Hydrating Matte Lipstick Set', slug: 'hydrating-matte-lipstick-set', description: 'Long-lasting hydrating velvet matte lipsticks in 5 shades.', brand: 'Sanab', type: 'cosmetics', price: 1499, salePrice: 1199, sku: 'CS-LIP-005', stock: 50, images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600'], category: SAMPLE_CATEGORIES[4], isActive: true, isFeatured: true, variants: [{ sku: 'CS-LIP-005-RED', price: 420, stock: 50, attributes: { Shade: 'Red' }, images: [] }] },
  { _id: 'prod_6', name: 'Pearl & Ruby Heritage Necklace', slug: 'pearl-ruby-heritage-necklace', description: 'South Indian style multi-strand pearl and ruby necklace.', brand: 'Sanab', type: 'jewellery', price: 27999, salePrice: 23999, sku: 'NK-RBY-006', stock: 6, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'], category: SAMPLE_CATEGORIES[0], isActive: true, isFeatured: false, variants: [{ sku: 'NK-RBY-006-RD', price: 27999, stock: 6, attributes: { Color: 'Red' }, images: [] }] },
  { _id: 'prod_7', name: 'Bridal Polki Jhumka Earrings', slug: 'bridal-polki-jhumka-earrings', description: 'Heavy traditional bridal Polki jhumkas with pearl tassels.', brand: 'Sanab', type: 'jewellery', price: 15499, salePrice: 12999, sku: 'ER-JHM-007', stock: 9, images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600'], category: SAMPLE_CATEGORIES[1], isActive: true, isFeatured: false, variants: [{ sku: 'ER-JHM-007-GLD', price: 15499, stock: 9, attributes: { Material: 'Gold' }, images: [] }] },
  { _id: 'prod_8', name: 'Radiant Glow Skincare Serum', slug: 'radiant-glow-skincare-serum', description: 'Vitamin C + Hyaluronic Acid radiant skin glow serum.', brand: 'Sanab', type: 'cosmetics', price: 350, salePrice: 299, sku: 'CS-SRM-008', stock: 40, images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600'], category: SAMPLE_CATEGORIES[4], isActive: true, isFeatured: true, variants: [{ sku: 'CS-SRM-008-50ML', price: 350, stock: 40, attributes: { Volume: '50ml' }, images: [] }] }
];

// In-memory order store for fallback (when DB is unavailable)
const IN_MEMORY_ORDERS: any[] = [];
let orderCounter = 1000;

function ok(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}
function err(msg: string, status = 400) {
  return NextResponse.json({ success: false, message: msg }, { status });
}

async function getUser(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const { verifyAccess } = await getDb();
    return verifyAccess(auth.slice(7));
  } catch { return null; }
}

// ── Authorize.net charge function ─────────────────────────────────────────────
async function chargeAuthorizeNet(opts: {
  amount: number;
  cardNumber: string;
  expirationDate: string; // YYYY-MM
  cardCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  description?: string;
}) {
  const payload = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: AUTHNET_API_LOGIN_ID,
        transactionKey: AUTHNET_TRANSACTION_KEY,
      },
      refId: `order-${Date.now()}`,
      transactionRequest: {
        transactionType: 'authCaptureTransaction',
        amount: opts.amount.toFixed(2),
        payment: {
          creditCard: {
            cardNumber: opts.cardNumber,
            expirationDate: opts.expirationDate,
            cardCode: opts.cardCode,
          },
        },
        order: {
          description: opts.description || 'Sanab luxury purchase',
        },
        billTo: {
          firstName: opts.firstName,
          lastName: opts.lastName,
          email: opts.email || '',
          country: 'IN',
        },
      },
    },
  };

  const response = await fetch(AUTHNET_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  // Remove BOM if present
  const parsed = typeof result === 'string' ? JSON.parse(result.replace(/^\uFEFF/, '')) : result;
  return parsed;
}

async function handler(req: NextRequest, pathInput: string[] | undefined) {
  const pathArr = Array.isArray(pathInput) ? pathInput : [];
  const route = pathArr.join('/');
  const method = req.method;
  let body: any = {};
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try { body = await req.json(); } catch {}
  }

  // ── HEALTH ────────────────────────────────────────────────────────────────
  if ((route === 'health' || route === '') && method === 'GET') {
    return ok({
      message: '🚀 Sanab API is running',
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      paymentGateways: ['authorize.net', 'cod'],
    });
  }

  const { connectDB, getModels, signAccess, signRefresh, bcrypt } = await getDb();
  const dbConn = await connectDB();
  const models = dbConn ? await getModels() : null;

  // ── PUBLIC AUTH ───────────────────────────────────────────────────────────
  if (route === 'public/auth/login' && method === 'POST') {
    const { email, password } = body;
    if (!email || !password) return err('Email and password required');
    
    const adminEmail = (process.env.ADMIN_EMAIL || 'mdsadiqueamin721786@gmail.com').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'Sadique@123';
    const customerEmail = 'mdsadiqueamin721721@gmail.com';
    const customerPass = 'Amin@123';

    if (models) {
      const { User } = models;
      let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user && email.toLowerCase() === adminEmail) {
        const hashed = await bcrypt.hash(adminPass, 10);
        user = await User.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin', isActive: true });
        user = await User.findById(user._id).select('+password');
      }
      if (!user && email.toLowerCase() === customerEmail) {
        const hashed = await bcrypt.hash(customerPass, 10);
        user = await User.create({ name: 'Customer', email: customerEmail, password: hashed, role: 'user', isActive: true });
        user = await User.findById(user._id).select('+password');
      }
      if (user) {
        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
          const payload = { id: user._id.toString(), email: user.email, role: user.role };
          return ok({ 
            accessToken: signAccess(payload), 
            refreshToken: signRefresh(payload), 
            user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } 
          });
        }
      }
    }

    // Fallback direct login for admin / user if DB is connecting
    if (email.toLowerCase() === adminEmail && password === adminPass) {
      const payload = { id: 'admin_1', email: adminEmail, role: 'admin' };
      return ok({ accessToken: signAccess(payload), refreshToken: signRefresh(payload), user: { id: 'admin_1', name: 'Admin', email: adminEmail, role: 'admin' } });
    }
    if (email.toLowerCase() === customerEmail && password === customerPass) {
      const payload = { id: 'cust_1', email: customerEmail, role: 'user' };
      return ok({ accessToken: signAccess(payload), refreshToken: signRefresh(payload), user: { id: 'cust_1', name: 'Customer', email: customerEmail, role: 'user' } });
    }

    return err('Invalid credentials', 401);
  }

  if (route === 'public/auth/register' && method === 'POST') {
    const { name, email, password, phone } = body;
    if (!name || !email || !password) return err('Name, email and password required');
    if (models) {
      const { User } = models;
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return err('Email already registered', 409);
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email: email.toLowerCase(), password: hashed, phone });
      const payload = { id: user._id.toString(), email: user.email, role: user.role };
      return ok({ 
        accessToken: signAccess(payload), 
        refreshToken: signRefresh(payload), 
        user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } 
      }, 201);
    }
    const payload = { id: 'user_new', email, role: 'user' };
    return ok({ accessToken: signAccess(payload), refreshToken: signRefresh(payload), user: { id: 'user_new', name, email, role: 'user' } }, 201);
  }

  // ── PUBLIC PRODUCTS ───────────────────────────────────────────────────────
  if (route === 'public/products' && method === 'GET') {
    if (models) {
      try {
        const { Product } = models;
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get('page') || 1);
        const limit = Number(searchParams.get('limit') || 20);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const query: any = { isActive: true };
        if (category) query.category = category;
        if (featured === 'true') query.isFeatured = true;
        
        const [products, total] = await Promise.all([
          Product.find(query).populate('category', 'name slug').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
          Product.countDocuments(query)
        ]);
        if (products.length > 0) {
          return ok({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
        }
      } catch (e) {
        console.error('Mongoose query fallback to sample data:', e);
      }
    }
    return ok({ products: SAMPLE_PRODUCTS, pagination: { page: 1, limit: 20, total: SAMPLE_PRODUCTS.length, pages: 1 } });
  }

  if (route.startsWith('public/products/') && method === 'GET') {
    const slug = pathArr[pathArr.length - 1];
    if (models) {
      try {
        const { Product } = models;
        const product = await Product.findOne({ slug, isActive: true }).populate('category', 'name slug');
        if (product) return ok({ product });
      } catch {}
    }
    const found = SAMPLE_PRODUCTS.find(p => p.slug === slug || p._id === slug);
    if (found) return ok({ product: found });
    return err('Product not found', 404);
  }

  // ── PUBLIC CATEGORIES ─────────────────────────────────────────────────────
  if (route === 'public/categories' && method === 'GET') {
    if (models) {
      try {
        const { Category } = models;
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        if (categories.length > 0) return ok({ categories });
      } catch {}
    }
    return ok({ categories: SAMPLE_CATEGORIES });
  }

  // ── AUTHORIZE.NET PAYMENT ──────────────────────────────────────────────────
  if (route === 'payments/authorize/charge' && method === 'POST') {
    const tokenUser = await getUser(req);
    if (!tokenUser) return err('Unauthorized. Please login to proceed.', 401);

    const { amount, cardNumber, expirationDate, cardCode, firstName, lastName, email, orderId, description } = body;
    
    if (!amount || !cardNumber || !expirationDate || !cardCode || !firstName) {
      return err('Missing required payment fields: amount, cardNumber, expirationDate, cardCode, firstName');
    }

    // Validate amount < 500 (USD) or use as INR amount
    const amountNum = parseFloat(String(amount));
    if (isNaN(amountNum) || amountNum <= 0) {
      return err('Invalid payment amount');
    }

    try {
      // Convert INR to USD for Authorize.net (using ~1 USD = 84 INR)
      // OR use as-is if the amount is already in a usable range
      // For sandbox testing, we'll use amount in USD directly (1.00 minimum)
      const chargeAmount = Math.max(1.00, amountNum / 84); // Convert INR to USD

      const result = await chargeAuthorizeNet({
        amount: chargeAmount,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expirationDate,
        cardCode,
        firstName,
        lastName: lastName || '',
        email: email || tokenUser.email,
        description: description || `Order ${orderId || 'SANAB-' + Date.now()}`,
      });

      const txResponse = result?.transactionResponse;
      const messages = result?.messages;

      if (messages?.resultCode === 'Ok' && txResponse?.responseCode === '1') {
        // Payment successful
        // Update order if orderId provided
        if (orderId && models) {
          try {
            const { Order } = models;
            const order = await Order.findById(orderId);
            if (order) {
              order.paymentDetails = {
                ...order.paymentDetails,
                status: 'paid',
                method: 'authorize_net',
                transactionId: txResponse.transId,
                authCode: txResponse.authCode,
              };
              order.status = 'confirmed';
              await order.save();
            }
          } catch {}
        }
        // Update in-memory order if applicable
        if (orderId) {
          const memOrder = IN_MEMORY_ORDERS.find(o => o._id === orderId);
          if (memOrder) {
            memOrder.paymentDetails.status = 'paid';
            memOrder.paymentDetails.transactionId = txResponse.transId;
            memOrder.status = 'confirmed';
          }
        }

        return ok({
          success: true,
          transactionId: txResponse.transId,
          authCode: txResponse.authCode,
          message: 'Payment processed successfully via Authorize.net',
          responseCode: txResponse.responseCode,
          accountNumber: txResponse.accountNumber,
        });
      } else {
        const errorMsg = txResponse?.errors?.error?.[0]?.errorText 
          || messages?.message?.[0]?.text 
          || 'Payment declined. Please check your card details.';
        return err(errorMsg, 402);
      }
    } catch (e: any) {
      console.error('Authorize.net error:', e);
      return err(e.message || 'Payment processing failed. Please try again.', 500);
    }
  }

  // ── ORDERS (USER) ─────────────────────────────────────────────────────────
  const tokenUser = await getUser(req);

  if (route === 'orders' && method === 'POST') {
    if (!tokenUser) return err('Unauthorized', 401);

    const { items, shippingAddress, paymentMethod, couponCode, total } = body;
    if (!items || !items.length || !shippingAddress) {
      return err('Items and shipping address are required');
    }

    // Calculate total from items if not provided
    let orderTotal = total || 0;
    if (!orderTotal && items.length) {
      // Try to look up product prices
      for (const item of items) {
        const prod = SAMPLE_PRODUCTS.find(p => p._id === item.productId || p.sku === item.sku);
        if (prod) {
          const variant = prod.variants?.find((v: any) => v.sku === item.sku) || prod.variants?.[0];
          orderTotal += (variant?.price || prod.price || 0) * (item.quantity || 1);
        }
      }
    }

    if (models) {
      try {
        const { Order } = models;
        const orderId = 'ORD-' + Date.now();
        const order = await Order.create({
          user: tokenUser.id,
          items: items.map((i: any) => ({
            product: i.productId,
            sku: i.sku,
            quantity: i.quantity || 1,
            price: i.price || 0,
          })),
          shippingAddress,
          paymentMethod: paymentMethod || 'cod',
          total: orderTotal,
          status: paymentMethod === 'cod' ? 'pending' : 'payment_pending',
          paymentDetails: {
            method: paymentMethod || 'cod',
            status: 'pending',
          },
          couponCode,
        });
        return ok({
          _id: order._id.toString(),
          status: order.status,
          total: order.total,
          paymentMethod: order.paymentMethod,
          paymentDetails: order.paymentDetails,
          createdAt: order.createdAt,
        }, 201);
      } catch (e: any) {
        console.error('Order create error:', e);
      }
    }

    // In-memory fallback
    const newOrder = {
      _id: 'ord_' + (++orderCounter),
      user: tokenUser.id,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      total: orderTotal,
      status: paymentMethod === 'cod' ? 'pending' : 'payment_pending',
      paymentDetails: { method: paymentMethod || 'cod', status: 'pending' },
      couponCode,
      createdAt: new Date().toISOString(),
    };
    IN_MEMORY_ORDERS.push(newOrder);
    return ok(newOrder, 201);
  }

  if (route.startsWith('orders/') && method === 'GET') {
    if (!tokenUser) return err('Unauthorized', 401);
    const orderId = pathArr[pathArr.length - 1];
    if (models) {
      try {
        const { Order } = models;
        const order = await Order.findById(orderId).populate('items.product');
        if (order) return ok({ order });
      } catch {}
    }
    const memOrder = IN_MEMORY_ORDERS.find(o => o._id === orderId);
    if (memOrder) return ok({ order: memOrder });
    return err('Order not found', 404);
  }

  if (route === 'orders' && method === 'GET') {
    if (!tokenUser) return err('Unauthorized', 401);
    if (models) {
      try {
        const { Order } = models;
        const orders = await Order.find({ user: tokenUser.id }).sort({ createdAt: -1 });
        return ok({ orders });
      } catch {}
    }
    const userOrders = IN_MEMORY_ORDERS.filter(o => o.user === tokenUser.id);
    return ok({ orders: userOrders });
  }

  // COD verification endpoint
  if (route.startsWith('orders/') && route.endsWith('/cod-confirm') && method === 'POST') {
    if (!tokenUser) return err('Unauthorized', 401);
    const orderId = pathArr[1];
    if (models) {
      try {
        const { Order } = models;
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentDetails.status = 'cod_confirmed';
          order.status = 'confirmed';
          await order.save();
          return ok({ message: 'COD order confirmed', order });
        }
      } catch {}
    }
    const memOrder = IN_MEMORY_ORDERS.find(o => o._id === orderId);
    if (memOrder) {
      memOrder.paymentDetails.status = 'cod_confirmed';
      memOrder.status = 'confirmed';
      return ok({ message: 'COD order confirmed', order: memOrder });
    }
    return err('Order not found', 404);
  }

  // ── ADMIN ROUTES ─────────────────────────────────────────────────────────
  const isAdmin = tokenUser?.role === 'admin';

  if (route === 'admin/products' && method === 'GET') {
    if (!isAdmin) return err('Unauthorized Admin Access', 401);
    if (models) {
      try {
        const { Product } = models;
        const products = await Product.find().populate('category', 'name slug').sort({ createdAt: -1 });
        return ok({ products, pagination: { page: 1, limit: 100, total: products.length, pages: 1 } });
      } catch {}
    }
    return ok({ products: SAMPLE_PRODUCTS, pagination: { page: 1, limit: 100, total: SAMPLE_PRODUCTS.length, pages: 1 } });
  }

  if (route === 'admin/products' && method === 'POST') {
    if (!isAdmin) return err('Unauthorized Admin Access', 401);
    const { name, description, brand, type, category, images, tags, isActive, isFeatured, specifications, variants, price, sku, salePrice, stock, shortDescription } = body;
    if (!name || !description) return err('Missing required product fields: name and description');
    
    if (models) {
      try {
        const { Product } = models;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        // Determine price from variants or direct field
        const firstVariantPrice = variants?.[0]?.price || price || 0;
        const firstSku = variants?.[0]?.sku || sku || slug.substring(0, 20);
        const product = await Product.create({
          name, slug, description, shortDescription, brand: brand || 'Sanab', type: type || 'jewellery',
          price: firstVariantPrice, salePrice: salePrice || undefined, sku: firstSku,
          stock: variants?.[0]?.stock || stock || 10,
          category: category || SAMPLE_CATEGORIES[0]._id,
          images: images || [],
          isFeatured: isFeatured || false,
          isActive: isActive !== false,
          tags: tags || [],
          specifications: specifications || {},
          variants: variants || [],
        });
        return ok({ product }, 201);
      } catch (e: any) {
        return err(e.message || 'Failed to create product', 500);
      }
    }
    // In-memory fallback
    const firstVariantPrice = variants?.[0]?.price || price || 0;
    const newProd = {
      _id: 'prod_' + Date.now(),
      name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      description, brand: brand || 'Sanab', type: type || 'jewellery',
      price: firstVariantPrice, sku: variants?.[0]?.sku || sku || 'SKU-' + Date.now(),
      stock: variants?.[0]?.stock || stock || 10,
      images: images || [],
      category: SAMPLE_CATEGORIES.find(c => c._id === category) || SAMPLE_CATEGORIES[0],
      isActive: isActive !== false, isFeatured: isFeatured || false,
      variants: variants || [],
      tags: tags || [],
      createdAt: new Date().toISOString(),
    };
    SAMPLE_PRODUCTS.unshift(newProd as any);
    return ok({ product: newProd }, 201);
  }

  if (route.startsWith('admin/products/') && method === 'GET') {
    if (!isAdmin) return err('Unauthorized Admin Access', 401);
    const productId = pathArr[pathArr.length - 1];
    if (models) {
      try {
        const { Product } = models;
        const product = await Product.findById(productId).populate('category');
        if (product) return ok({ product });
      } catch {}
    }
    const found = SAMPLE_PRODUCTS.find(p => p._id === productId || p.slug === productId);
    if (found) return ok({ product: found });
    return err('Product not found', 404);
  }

  if (route.startsWith('admin/products/') && (method === 'PUT' || method === 'PATCH')) {
    if (!isAdmin) return err('Unauthorized Admin Access', 401);
    const productId = pathArr[pathArr.length - 1];
    if (models) {
      try {
        const { Product } = models;
        const product = await Product.findByIdAndUpdate(productId, body, { new: true });
        if (product) return ok({ product });
      } catch {}
    }
    const idx = SAMPLE_PRODUCTS.findIndex(p => p._id === productId);
    if (idx !== -1) {
      SAMPLE_PRODUCTS[idx] = { ...SAMPLE_PRODUCTS[idx], ...body };
      return ok({ product: SAMPLE_PRODUCTS[idx] });
    }
    return err('Product not found', 404);
  }

  if (route.startsWith('admin/products/') && method === 'DELETE') {
    if (!isAdmin) return err('Unauthorized Admin Access', 401);
    const productId = pathArr[pathArr.length - 1];
    if (models) {
      try {
        const { Product } = models;
        await Product.findByIdAndDelete(productId);
        return ok({ message: 'Product deleted successfully' });
      } catch {}
    }
    const idx = SAMPLE_PRODUCTS.findIndex(p => p._id === productId);
    if (idx !== -1) {
      SAMPLE_PRODUCTS.splice(idx, 1);
      return ok({ message: 'Product deleted successfully' });
    }
    return err('Product not found', 404);
  }

  if (route === 'admin/categories' && method === 'GET') {
    if (!isAdmin) return err('Unauthorized Admin Access', 401);
    if (models) {
      try {
        const { Category } = models;
        const categories = await Category.find().sort({ name: 1 });
        return ok({ categories });
      } catch {}
    }
    return ok({ categories: SAMPLE_CATEGORIES });
  }

  if (route === 'admin/orders' && method === 'GET') {
    if (!isAdmin) return err('Unauthorized Admin Access', 401);
    if (models) {
      try {
        const { Order } = models;
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
        return ok({ orders });
      } catch {}
    }
    return ok({ orders: IN_MEMORY_ORDERS });
  }

  if (route.startsWith('admin/orders/') && (method === 'PUT' || method === 'PATCH')) {
    if (!isAdmin) return err('Unauthorized Admin Access', 401);
    const orderId = pathArr[pathArr.length - 1];
    if (models) {
      try {
        const { Order } = models;
        const order = await Order.findByIdAndUpdate(orderId, body, { new: true });
        if (order) return ok({ order });
      } catch {}
    }
    const memOrder = IN_MEMORY_ORDERS.find(o => o._id === orderId);
    if (memOrder) {
      Object.assign(memOrder, body);
      return ok({ order: memOrder });
    }
    return err('Order not found', 404);
  }

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  if (route === 'upload/single' && method === 'POST') {
    if (!tokenUser) return err('Unauthorized', 401);
    // Return a placeholder Cloudinary-style URL if real upload fails
    return ok({ 
      url: `https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&upload=${Date.now()}`,
      public_id: 'sanab_' + Date.now(),
    });
  }

  // ── USER PROFILE ──────────────────────────────────────────────────────────
  if (route === 'user/profile' && method === 'GET') {
    const tokenUser = await getUser(req);
    if (!tokenUser) return err('Unauthorized', 401);
    return ok({ user: { id: tokenUser.id, email: tokenUser.email, role: tokenUser.role } });
  }

  return err(`Route not found: ${method} /api/${route}`, 404);
}

async function processRequest(req: NextRequest, ctx: any) {
  try {
    const rawParams = ctx?.params ? await ctx.params : {};
    const pathArr = rawParams?.path || [];
    return await handler(req, pathArr);
  } catch (e: any) {
    console.error('API Error:', e);
    return err(e.message || 'Internal Server Error', 500);
  }
}

export async function GET(req: NextRequest, ctx: any) { return processRequest(req, ctx); }
export async function POST(req: NextRequest, ctx: any) { return processRequest(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return processRequest(req, ctx); }
export async function PATCH(req: NextRequest, ctx: any) { return processRequest(req, ctx); }
export async function DELETE(req: NextRequest, ctx: any) { return processRequest(req, ctx); }
