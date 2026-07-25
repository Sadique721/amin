/**
 * add-more-products.cjs
 * Adds 3 more products via the REST API.
 */
const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 10001, path, method,
      headers: { 'Content-Type': 'application/json', ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    };
    const req = http.request(opts, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, body: d }); } }); });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function getCatId(token, name) {
  const r = await request('GET', '/api/public/categories', null, token);
  const cats = Array.isArray(r.body.data) ? r.body.data : [];
  const found = cats.find(c => c.name === name);
  return found?._id;
}

async function main() {
  const loginRes = await request('POST', '/api/public/auth/otp/verify', { email: 'mdsadiqueamin721786@gmail.com', otp: 'Sadique@123' });
  const token = loginRes.body.data?.accessToken;
  if (!token) { console.error('Login failed'); return; }
  console.log('✅ Logged in\n');

  const catRings = await getCatId(token, 'Gold Rings');
  const catEar   = await getCatId(token, 'Luxury Earrings');
  const catSkin  = await getCatId(token, 'Natural Skin Creams');
  const catLip   = await getCatId(token, 'Matte Lipsticks');

  const products = [
    {
      name: 'Royal Pearl Drop Earrings',
      brand: 'SANAB Atelier', type: 'jewellery',
      description: 'Lustrous freshwater pearl drops framed in 18K yellow gold vermeil with diamond-set tops.',
      images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop'],
      category: catEar,
      tags: ['earrings', 'pearl', 'gold', 'jewellery'], isActive: true,
      variants: [{ sku: 'SNB-JWL-ER-996', price: 32000, compareAtPrice: 38000, stock: 15, attributes: { metal: '18K Gold Vermeil' }, isActive: true }],
    },
    {
      name: 'Radiance Glow Face Cream',
      brand: 'SANAB Beauty', type: 'cosmetics',
      description: 'Ultra-rich hydrating face cream with 24K gold peptides and botanical hyaluronic acid for radiant skin.',
      images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600&auto=format&fit=crop'],
      category: catSkin,
      tags: ['face cream', 'skincare', 'gold', 'cosmetics'], isActive: true,
      variants: [{ sku: 'SNB-COS-FC-997', price: 3500, compareAtPrice: 4200, stock: 40, attributes: { volume: '50ml' }, isActive: true }],
    },
    {
      name: 'Stacked Pavé Diamond Ring',
      brand: 'SANAB Atelier', type: 'jewellery',
      description: 'Contemporary stackable pavé-set diamond band in 14K white gold, perfect for layering.',
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop'],
      category: catRings,
      tags: ['ring', 'diamond', 'stackable', 'jewellery'], isActive: true,
      variants: [{ sku: 'SNB-JWL-RG-998', price: 58000, compareAtPrice: 68000, stock: 8, attributes: { metal: '14K White Gold', size: '6' }, isActive: true }],
    },
  ];

  for (const p of products) {
    const res = await request('POST', '/api/public/products', p, token);
    if (res.status === 201 || res.status === 200) console.log(`✅ "${p.name}" added`);
    else console.error(`❌ "${p.name}" failed:`, res.body?.message);
    await new Promise(r => setTimeout(r, 400));
  }

  // Final count
  const list = await request('GET', '/api/public/products', null, null);
  const all = list.body.data?.results || [];
  console.log(`\n📦 Total products in store: ${list.body.data?.totalResults || all.length}`);
  all.forEach((p, i) => console.log(`  ${i+1}. [${p.type}] ${p.name} — ₹${p.variants?.[0]?.price?.toLocaleString('en-IN')}`));
}

main().catch(console.error);
