/**
 * seed-products.cjs
 * Seeds 5 products via the backend REST API.
 * Run: node scripts/seed-products.cjs
 */

const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 10001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function ensureCategory(token, name, description) {
  // Get all categories (no query params to avoid filter issues)
  const listRes = await request('GET', '/api/public/categories', null, token);
  if (listRes.status === 200) {
    const cats = Array.isArray(listRes.body.data) ? listRes.body.data : [];
    const found = cats.find((c) => c.name === name);
    if (found) {
      console.log(`  ✓ Category exists: ${name} (${found._id})`);
      return found._id;
    }
  }

  // Create the category
  const createRes = await request('POST', '/api/public/categories', { name, description }, token);
  if ((createRes.status === 201 || createRes.status === 200) && createRes.body.data?._id) {
    const id = createRes.body.data._id;
    console.log(`  📁 Category created: ${name} (${id})`);
    return id;
  }

  // If duplicate key error, try fetching by slug
  if (createRes.body?.message?.includes('duplicate key')) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const slugRes = await request('GET', `/api/public/categories/${slug}`, null, token);
    if (slugRes.status === 200 && slugRes.body.data?._id) {
      console.log(`  ✓ Found existing category by slug: ${name} (${slugRes.body.data._id})`);
      return slugRes.body.data._id;
    }
  }

  console.warn(`  ⚠️  Could not get/create category "${name}" — will proceed without category ID`);
  return undefined;
}

async function createProduct(token, product) {
  const res = await request('POST', '/api/public/products', product, token);
  if (res.status === 201 || res.status === 200) {
    const p = res.body.data;
    console.log(`  ✅ "${product.name}" → ID: ${p?._id || '?'}`);
    return p;
  }
  console.error(`  ❌ Failed "${product.name}": HTTP ${res.status} — ${res.body?.message || JSON.stringify(res.body).slice(0, 150)}`);
  return null;
}

async function main() {
  console.log('\n🚀 Amin — Product Seeder v3\n');

  // ── Login
  console.log('🔐 Logging in as admin...');
  const loginRes = await request('POST', '/api/public/auth/otp/verify', {
    email: 'mdsadiqueamin721786@gmail.com',
    otp: 'Sadique@123',
  });

  if (loginRes.status !== 200) {
    console.error('❌ Login failed:', loginRes.status, JSON.stringify(loginRes.body).slice(0, 300));
    process.exit(1);
  }
  const token = loginRes.body.data?.accessToken;
  const role = loginRes.body.data?.user?.role;
  console.log(`✅ Logged in. Role: ${role}\n`);

  // ── Ensure categories exist
  console.log('📂 Ensuring categories...');
  const catIds = {};
  catIds['Gold Rings']           = await ensureCategory(token, 'Gold Rings', 'Fine 18k and 22k gold rings');
  catIds['Diamond Necklaces']    = await ensureCategory(token, 'Diamond Necklaces', 'Ethically sourced diamond pendants and necklaces');
  catIds['Luxury Earrings']      = await ensureCategory(token, 'Luxury Earrings', 'Elegant studs, drops, and hoops');
  catIds['Matte Lipsticks']      = await ensureCategory(token, 'Matte Lipsticks', 'Highly pigmented luxury lip cosmetics');
  catIds['Natural Skin Creams']  = await ensureCategory(token, 'Natural Skin Creams', 'Premium botanical face and skin formulations');
  console.log('');

  // ── Products to add
  const PRODUCTS = [
    {
      name: 'Elegant Solitaire Ring',
      brand: 'AMIN Atelier',
      type: 'jewellery',
      description: 'Dazzling 1-carat round brilliant solitaire diamond set in 18K yellow gold prongs. A timeless piece for special occasions.',
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop'],
      category: catIds['Gold Rings'],
      tags: ['ring', 'gold', 'diamond', 'solitaire'],
      isActive: true,
      variants: [
        { price: 49999, compareAtPrice: 55999, stock: 15, attributes: 'Size 6 / 18K Gold', images: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop' },
      ],
    },
    {
      name: 'Royal Heritage Diamond Necklace',
      brand: 'AMIN Atelier',
      type: 'jewellery',
      description: 'Exquisite 22K hallmarked gold choker necklace studded with VS clarity certified diamonds and Zambian emerald drop accents.',
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
      category: catIds['Diamond Necklaces'],
      tags: ['necklace', 'diamond', 'emerald', 'luxury'],
      isActive: true,
      variants: [
        { price: 125000, compareAtPrice: 140000, stock: 5, attributes: '22K Gold / Emerald Drop', images: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop' },
      ],
    },
    {
      name: 'Velvet Matte Liquid Lipstick — Ruby Red',
      brand: 'AMIN Beauty',
      type: 'cosmetics',
      description: 'Ultra-pigmented 16-hour transfer-proof matte liquid lipstick enriched with vitamin E and jojoba oil for soft, hydrated lips.',
      images: ['https://images.unsplash.com/photo-1586495777744-4e6232bf4803?q=80&w=600&auto=format&fit=crop'],
      category: catIds['Matte Lipsticks'],
      tags: ['lipstick', 'matte', 'cosmetics'],
      isActive: true,
      variants: [{ sku: 'SNB-COS-LP-993', price: 2200, compareAtPrice: 2600, stock: 80, attributes: { shade: 'Cherry Red' }, isActive: true }],
    },
    {
      name: 'Clarifying Vitamin Serum',
      brand: 'SANAB Beauty',
      type: 'cosmetics',
      description: 'Deeply nourishing Vitamin C serum designed to target blemishes and brighten skin tone.',
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop'],
      category: catIds['Natural Skin Creams'],
      tags: ['serum', 'vitamin c', 'skincare'],
      isActive: true,
      variants: [{ sku: 'SNB-COS-SR-994', price: 1950, compareAtPrice: 2400, stock: 60, attributes: { volume: '30ml' }, isActive: true }],
    },
    {
      name: 'Gold Mesh Hoop Earrings',
      brand: 'SANAB Atelier',
      type: 'jewellery',
      description: 'Intricately woven gold mesh hoop earrings crafted in high-polish 18K yellow gold.',
      images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop'],
      category: catIds['Luxury Earrings'],
      tags: ['earrings', 'gold', 'hoop'],
      isActive: true,
      variants: [{ sku: 'SNB-JWL-ER-995', price: 48000, compareAtPrice: 55000, stock: 12, attributes: { metal: '18K Yellow Gold' }, isActive: true }],
    },
  ];

  // ── Create products
  console.log('📦 Creating products...\n');
  let successCount = 0;
  for (const p of PRODUCTS) {
    const result = await createProduct(token, p);
    if (result) successCount++;
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n✨ ${successCount}/5 products created.\n`);

  // ── Verify
  console.log('📋 Verifying product list...');
  const listRes = await request('GET', '/api/public/products', null, null);
  if (listRes.status === 200) {
    const raw = listRes.body.data;
    const docs = Array.isArray(raw) ? raw : (raw?.docs || []);
    const total = raw?.totalDocs || docs.length;
    console.log(`\n✅ Total products visible in store: ${total}`);
    docs.slice(0, 8).forEach((p, i) => {
      const price = p.variants?.[0]?.price;
      console.log(`  ${i + 1}. [${p.type}] ${p.name} — ₹${price ? price.toLocaleString('en-IN') : '?'}`);
    });
  } else {
    console.log('⚠️  Product list fetch issue:', listRes.status, JSON.stringify(listRes.body).slice(0, 200));
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
