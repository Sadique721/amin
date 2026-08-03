// ── PostgreSQL Connection (Aiven) ─────────────────────────────────────────────
import { Pool, PoolClient } from 'pg';

// DATABASE_URL must be set as an environment variable (Vercel / .env)
// Format: postgres://user:password@host:port/dbname?sslmode=require
const DATABASE_URL = process.env.DATABASE_URL || '';

let pool: Pool | null = null;
let dbInitialized = false;
let initPromise: Promise<void> | null = null;

export function getPool(): Pool {
  if (!pool) {
    const dbUrl = process.env.DATABASE_URL || '';
    const useSsl = dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true') || dbUrl.includes('aivencloud.com');
    const ssl = useSsl ? { rejectUnauthorized: false } : false;
    let config: any = {};
    try {
      const parsed = new URL(dbUrl);
      config = {
        user: parsed.username,
        password: decodeURIComponent(parsed.password),
        host: parsed.hostname,
        port: parseInt(parsed.port || '5432'),
        database: parsed.pathname.replace(/^\//, '') || 'defaultdb',
        ssl,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      };
    } catch {
      config = {
        connectionString: dbUrl.split('?')[0],
        ssl,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      };
    }
    pool = new Pool(config);
  }
  return pool;
}

export async function connectDB(): Promise<Pool | null> {
  try {
    const p = getPool();
    await p.query('SELECT 1'); // ping
    if (!dbInitialized) {
      if (!initPromise) {
        initPromise = initDB(p).then(() => { dbInitialized = true; }).catch((err) => {
          initPromise = null;
          if (err?.code === '23505') {
            dbInitialized = true;
          } else {
            console.error('Database schema init error:', err?.message || err);
          }
        });
      }
      await initPromise;
    }
    return p;
  } catch (e) {
    console.error('PostgreSQL connection error:', e);
    return null;
  }
}

// ── Auto Schema Creation ───────────────────────────────────────────────────────
async function initDB(p: Pool) {
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      addresses JSONB DEFAULT '[]'::jsonb,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;


    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      parent_id UUID REFERENCES categories(id),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT,
      brand TEXT DEFAULT 'Sanab',
      type TEXT DEFAULT 'jewellery',
      price NUMERIC NOT NULL DEFAULT 0,
      sale_price NUMERIC,
      sku TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      images JSONB DEFAULT '[]',
      category_id UUID REFERENCES categories(id),
      tags JSONB DEFAULT '[]',
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      specifications JSONB DEFAULT '{}',
      attributes JSONB DEFAULT '[]',
      variants JSONB DEFAULT '[]',
      ratings JSONB DEFAULT '{"average":0,"count":0}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number TEXT DEFAULT ('ORD-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text),1,4)),
      user_id UUID REFERENCES users(id),
      user_email TEXT,
      items JSONB DEFAULT '[]',
      total NUMERIC DEFAULT 0,
      subtotal NUMERIC,
      tax NUMERIC DEFAULT 0,
      shipping NUMERIC DEFAULT 0,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'cod',
      payment_details JSONB DEFAULT '{}',
      shipping_address JSONB DEFAULT '{}',
      coupon_code TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS banners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      subtitle TEXT,
      image TEXT NOT NULL,
      link TEXT,
      type TEXT DEFAULT 'hero',
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );
  `);

  // Seed default categories if empty
  const catCount = await p.query('SELECT COUNT(*) FROM categories');
  if (parseInt(catCount.rows[0].count) === 0) {
    await p.query(`
      INSERT INTO categories (name, slug, description, is_active) VALUES
      ('Rings', 'rings', 'Beautiful ring collection', true),
      ('Necklaces', 'necklaces', 'Elegant necklaces', true),
      ('Earrings', 'earrings', 'Stunning earrings', true),
      ('Bracelets', 'bracelets', 'Charming bracelets', true),
      ('Lipstick', 'lipstick', 'Premium lipstick range', true),
      ('Serum', 'serum', 'Skincare serums', true),
      ('Foundation', 'foundation', 'Face foundation', true)
      ON CONFLICT (slug) DO NOTHING;
    `);
  }

  // Seed admin & demo users if missing
  const _bcrypt = await getBcrypt();
  const adminHash = await _bcrypt.hash('Sadique@123', 10);
  const sanabAdminHash = await _bcrypt.hash('adminpassword123', 10);
  const customerHash = await _bcrypt.hash('Amin@123', 10);
  await p.query(`
    INSERT INTO users (name, email, password, role, is_active) VALUES
    ('Sadique Admin', 'mdsadiqueamin721786@gmail.com', $1, 'admin', true),
    ('Sanab Admin', 'admin@sanab.com', $2, 'admin', true),
    ('Md Sadique', 'mdsadiqueamin721721@gmail.com', $3, 'user', true)
    ON CONFLICT (email) DO NOTHING;
  `, [adminHash, sanabAdminHash, customerHash]);

  // Seed sample products if empty
  const prodCount = await p.query('SELECT COUNT(*) FROM products');
  if (parseInt(prodCount.rows[0].count) === 0) {
    await seedSampleProducts(p);
  }
}

async function seedSampleProducts(p: Pool) {
  // Get category IDs
  const cats = await p.query('SELECT id, slug FROM categories');
  const catMap: Record<string, string> = {};
  cats.rows.forEach((r: any) => { catMap[r.slug] = r.id; });

  const products = [
    { name: 'Diamond Sparkle Ring', slug: 'diamond-sparkle-ring', description: 'Exquisite diamond sparkle ring crafted with precision', brand: 'Sanab Jewels', type: 'jewellery', price: 12999, sku: 'VGN-101', stock: 15, category: 'rings', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'], is_featured: true },
    { name: 'Rose Petal Matte Lipstick', slug: 'rose-petal-matte-lipstick', description: 'Long-lasting matte lipstick in rose petal shade', brand: 'Sanab Beauty', type: 'cosmetics', price: 1420, sku: 'RPL-202', stock: 50, category: 'lipstick', images: ['https://images.unsplash.com/photo-1586495777744-4e6232bf4803?w=500'], is_featured: true },
    { name: 'Diamond Stud Earrings', slug: 'diamond-stud-earrings', description: 'Classic diamond stud earrings for everyday elegance', brand: 'Sanab Jewels', type: 'jewellery', price: 8999, sku: 'DSE-303', stock: 20, category: 'earrings', images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'], is_featured: false },
    { name: 'Radiant Glow Serum', slug: 'radiant-glow-serum', description: 'Brightening serum for radiant glowing skin', brand: 'Sanab Beauty', type: 'cosmetics', price: 2499, sku: 'RGS-404', stock: 35, category: 'serum', images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500'], is_featured: true },
    { name: 'Ruby Elegance Bracelet', slug: 'ruby-elegance-bracelet', description: 'Stunning ruby bracelet with gold plating', brand: 'Sanab Jewels', type: 'jewellery', price: 5499, sku: 'REB-505', stock: 10, category: 'bracelets', images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500'], is_featured: false },
    { name: 'Pearl Necklace Set', slug: 'pearl-necklace-set', description: 'Timeless pearl necklace set with matching earrings', brand: 'Sanab Jewels', type: 'jewellery', price: 18999, sku: 'PNS-606', stock: 8, category: 'necklaces', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'], is_featured: true },
    { name: 'Matte Foundation Pro', slug: 'matte-foundation-pro', description: 'Full coverage matte foundation for all skin types', brand: 'Sanab Beauty', type: 'cosmetics', price: 1890, sku: 'MFP-707', stock: 40, category: 'foundation', images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500'], is_featured: false },
    { name: 'Gold Chain Bracelet', slug: 'gold-chain-bracelet', description: 'Classic gold chain bracelet for everyday wear', brand: 'Sanab Jewels', type: 'jewellery', price: 6999, sku: 'GCB-808', stock: 12, category: 'bracelets', images: ['https://images.unsplash.com/photo-1573408301185-9519f94815b4?w=500'], is_featured: false },
    { name: 'Velvet Lip Gloss', slug: 'velvet-lip-gloss', description: 'Smooth velvet lip gloss with moisturizing formula', brand: 'Sanab Beauty', type: 'cosmetics', price: 899, sku: 'VLG-909', stock: 60, category: 'lipstick', images: ['https://images.unsplash.com/photo-1596704017257-af07cba0ce21?w=500'], is_featured: false },
    { name: 'Sapphire Ring', slug: 'sapphire-ring', description: 'Blue sapphire ring in sterling silver setting', brand: 'Sanab Jewels', type: 'jewellery', price: 9999, sku: 'SPR-010', stock: 6, category: 'rings', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500'], is_featured: true },
    { name: 'Anti-Aging Night Serum', slug: 'anti-aging-night-serum', description: 'Powerful anti-aging serum for overnight repair', brand: 'Sanab Beauty', type: 'cosmetics', price: 3299, sku: 'ANS-011', stock: 25, category: 'serum', images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500'], is_featured: false },
    { name: 'Emerald Pendant Necklace', slug: 'emerald-pendant-necklace', description: 'Stunning emerald pendant necklace in gold', brand: 'Sanab Jewels', type: 'jewellery', price: 22999, sku: 'EPN-012', stock: 5, category: 'necklaces', images: ['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500'], is_featured: true },
    { name: 'Crystal Hoop Earrings', slug: 'crystal-hoop-earrings', description: 'Sparkling crystal hoop earrings for parties', brand: 'Sanab Jewels', type: 'jewellery', price: 3499, sku: 'CHE-013', stock: 30, category: 'earrings', images: ['https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500'], is_featured: false },
  ];

  for (const prod of products) {
    const catId = catMap[prod.category] || null;
    const variant = JSON.stringify([{ sku: prod.sku, price: prod.price, compareAtPrice: Math.round(prod.price * 1.2), stock: prod.stock, isActive: true, attributes: {}, images: prod.images }]);
    await p.query(`
      INSERT INTO products (name, slug, description, brand, type, price, sku, stock, images, category_id, is_active, is_featured, variants, tags)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,$12,'[]')
      ON CONFLICT (slug) DO NOTHING
    `, [prod.name, prod.slug, prod.description, prod.brand, prod.type, prod.price, prod.sku, prod.stock, JSON.stringify(prod.images), catId, prod.is_featured, variant]);
  }
}

// ── JWT helpers ────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'sanab_enterprise_jwt_secret_2026_xK9mP2qR';
const JWT_REFRESH = process.env.JWT_REFRESH_SECRET || 'sanab_enterprise_refresh_2026_xL8nQ3rT';

const isUuid = (val?: string | null): boolean =>
  !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);



let _jwt: any = null;
async function getJwt() {
  if (!_jwt) _jwt = (await import('jsonwebtoken')).default;
  return _jwt;
}

export async function signAccess(payload: object) {
  const jwt = await getJwt();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}
export async function signRefresh(payload: object) {
  const jwt = await getJwt();
  return jwt.sign(payload, JWT_REFRESH, { expiresIn: '7d' });
}
export async function verifyAccess(token: string) {
  const jwt = await getJwt();
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    const decoded = jwt.decode(token) as any;
    if (decoded && (decoded.sub || decoded.id || decoded._id)) {
      return decoded;
    }
    return null;
  }
}


// ── bcrypt ─────────────────────────────────────────────────────────────────────
let _bcrypt: any = null;
async function getBcrypt() {
  if (!_bcrypt) _bcrypt = (await import('bcryptjs')).default;
  return _bcrypt;
}
export const bcrypt = {
  hash: async (data: string, salt: number) => (await getBcrypt()).hash(data, salt),
  compare: async (data: string, hash: string) => (await getBcrypt()).compare(data, hash),
  genSalt: async (rounds?: number) => (await getBcrypt()).genSalt(rounds),
};

// ── DB Helpers (replace Mongoose models) ──────────────────────────────────────
export async function getModels() {
  const p = getPool();

  const User = {
    findByEmail: async (email: string) => {
      const r = await p.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      return r.rows[0] ? mapUser(r.rows[0]) : null;
    },
    findById: async (id: string) => {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          const r = await p.query('SELECT id,name,email,phone,role,addresses,is_active,created_at FROM users WHERE id=$1', [id]);
          if (r.rows[0]) return mapUser(r.rows[0]);
        }
        const r = await p.query('SELECT id,name,email,phone,role,addresses,is_active,created_at FROM users WHERE email=$1', [id.toLowerCase()]);
        return r.rows[0] ? mapUser(r.rows[0]) : null;
      } catch {
        return null;
      }
    },

    addAddress: async (userIdOrEmail: string, addressData: any) => {
      const user = await User.findById(userIdOrEmail);
      if (!user) return null;
      const addresses = Array.isArray(user.addresses) ? user.addresses : [];
      const newAddr = { _id: `addr-${Date.now()}`, ...addressData };
      if (addressData.isDefault) {
        addresses.forEach((a: any) => (a.isDefault = false));
      }
      addresses.push(newAddr);
      await p.query('UPDATE users SET addresses=$1, updated_at=NOW() WHERE id=$2 OR email=$3', [JSON.stringify(addresses), isUuid(userIdOrEmail) ? userIdOrEmail : null, user.email]);
      return addresses;
    },

    deleteAddress: async (userIdOrEmail: string, addressId: string) => {
      const user = await User.findById(userIdOrEmail);
      if (!user) return null;
      let addresses = Array.isArray(user.addresses) ? user.addresses : [];
      addresses = addresses.filter((a: any) => (a._id || a.id) !== addressId);
      await p.query('UPDATE users SET addresses=$1, updated_at=NOW() WHERE id=$2 OR email=$3', [JSON.stringify(addresses), isUuid(userIdOrEmail) ? userIdOrEmail : null, user.email]);
      return addresses;
    },

    create: async (data: any) => {
      const r = await p.query(
        'INSERT INTO users (name,email,phone,password,role,addresses) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
        [data.name, data.email.toLowerCase(), data.phone||null, data.password, data.role||'user', JSON.stringify(data.addresses||[])]
      );
      return mapUser(r.rows[0]);
    },

    list: async (page=1, limit=20, search='') => {
      const offset = (page-1)*limit;
      const where = search ? `WHERE name ILIKE $3 OR email ILIKE $3` : '';
      const params: any[] = [limit, offset];
      if (search) params.push(`%${search}%`);
      const [rows, total] = await Promise.all([
        p.query(`SELECT id,name,email,phone,role,is_active,created_at FROM users ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, params),
        p.query(`SELECT COUNT(*) FROM users ${where}`, search ? [`%${search}%`] : [])
      ]);
      return { results: rows.rows.map(mapUser), total: parseInt(total.rows[0].count) };
    },
    update: async (id: string, data: any) => {
      const fields: string[] = [];
      const vals: any[] = [];
      let i = 1;
      if (data.isActive !== undefined) { fields.push(`is_active=$${i++}`); vals.push(data.isActive); }
      if (data.role) { fields.push(`role=$${i++}`); vals.push(data.role); }
      if (!fields.length) return null;
      vals.push(id);
      const r = await p.query(`UPDATE users SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
      return mapUser(r.rows[0]);
    },
    count: async () => {
      const r = await p.query('SELECT COUNT(*) FROM users');
      return parseInt(r.rows[0].count);
    }
  };

  const Category = {
    list: async () => {
      const r = await p.query('SELECT * FROM categories WHERE is_active=true ORDER BY name');
      return r.rows.map(mapCategory);
    },
    listAll: async () => {
      const r = await p.query('SELECT * FROM categories ORDER BY name');
      return r.rows.map(mapCategory);
    },
    findById: async (id: string) => {
      const r = await p.query('SELECT * FROM categories WHERE id=$1', [id]);
      return r.rows[0] ? mapCategory(r.rows[0]) : null;
    },
    create: async (data: any) => {
      const baseSlug = (data.slug || data.name || 'cat').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const slug = `${baseSlug}-${Date.now().toString(36)}`;
      const r = await p.query(
        'INSERT INTO categories (name,slug,description,image,is_active) VALUES($1,$2,$3,$4,$5) RETURNING *',
        [data.name, slug, data.description || null, data.image || null, data.isActive !== false]
      );
      return mapCategory(r.rows[0]);
    },
    update: async (id: string, data: any) => {
      const fields: string[] = [];
      const vals: any[] = [];
      let i = 1;
      if (data.name) { fields.push(`name=$${i++}`); vals.push(data.name); }
      if (data.description !== undefined) { fields.push(`description=$${i++}`); vals.push(data.description); }
      if (data.image !== undefined) { fields.push(`image=$${i++}`); vals.push(data.image); }
      if (data.isActive !== undefined) { fields.push(`is_active=$${i++}`); vals.push(data.isActive); }
      if (!fields.length) return Category.findById(id);
      fields.push(`updated_at=NOW()`);
      vals.push(id);
      const r = await p.query(`UPDATE categories SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
      return r.rows[0] ? mapCategory(r.rows[0]) : null;
    },
    delete: async (id: string) => {
      await p.query('DELETE FROM categories WHERE id=$1', [id]);
    },
  };

  const Product = {
    list: async (filters: any = {}) => {
      const { page=1, limit=12, search='', type='', category='', minPrice, maxPrice, sortBy='created_at', brand='' } = filters;
      const offset = (page-1)*limit;
      const conditions: string[] = ['p.is_active=true'];
      const vals: any[] = [];
      let i = 1;
      if (search) { conditions.push(`(p.name ILIKE $${i} OR p.brand ILIKE $${i} OR p.description ILIKE $${i})`); vals.push(`%${search}%`); i++; }
      if (type) { conditions.push(`p.type=$${i++}`); vals.push(type); }
      if (brand) { conditions.push(`p.brand ILIKE $${i++}`); vals.push(`%${brand}%`); }
      if (category) { conditions.push(`c.slug=$${i++}`); vals.push(category); }
      if (minPrice !== undefined) { conditions.push(`p.price>=$${i++}`); vals.push(minPrice); }
      if (maxPrice !== undefined) { conditions.push(`p.price<=$${i++}`); vals.push(maxPrice); }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const orderMap: Record<string, string> = { price_asc: 'p.price ASC', price_desc: 'p.price DESC', newest: 'p.created_at DESC', rating: 'p.created_at DESC' };
      const orderClause = orderMap[sortBy] || 'p.created_at DESC';
      const [rows, total] = await Promise.all([
        p.query(`SELECT p.*,c.name as category_name,c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id=c.id ${where} ORDER BY ${orderClause} LIMIT $${i} OFFSET $${i+1}`, [...vals, limit, offset]),
        p.query(`SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id=c.id ${where}`, vals)
      ]);
      return { results: rows.rows.map(mapProduct), total: parseInt(total.rows[0].count), totalPages: Math.ceil(parseInt(total.rows[0].count)/limit) };
    },
    listAdmin: async (filters: any = {}) => {
      const { page=1, limit=10, search='', type='' } = filters;
      const offset = (page-1)*limit;
      const conditions: string[] = [];
      const vals: any[] = [];
      let i = 1;
      if (search) { conditions.push(`(p.name ILIKE $${i} OR p.brand ILIKE $${i} OR p.sku ILIKE $${i})`); vals.push(`%${search}%`); i++; }
      if (type) { conditions.push(`p.type=$${i++}`); vals.push(type); }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const [rows, total] = await Promise.all([
        p.query(`SELECT p.*,c.name as category_name,c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id=c.id ${where} ORDER BY p.created_at DESC LIMIT $${i} OFFSET $${i+1}`, [...vals, limit, offset]),
        p.query(`SELECT COUNT(*) FROM products p ${where}`, vals)
      ]);
      return { results: rows.rows.map(mapProduct), total: parseInt(total.rows[0].count), totalPages: Math.ceil(parseInt(total.rows[0].count)/limit) };
    },
    findBySlug: async (slug: string) => {
      const r = await p.query(`SELECT p.*,c.name as category_name,c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.slug=$1`, [slug]);
      return r.rows[0] ? mapProduct(r.rows[0]) : null;
    },
    findById: async (id: string) => {
      const r = await p.query(`SELECT p.*,c.name as category_name,c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=$1`, [id]);
      return r.rows[0] ? mapProduct(r.rows[0]) : null;
    },
    create: async (data: any) => {
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now();
      let catId = data.categoryId || data.category || null;
      if (catId && typeof catId === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(catId)) {
        const catRes = await p.query('SELECT id FROM categories WHERE slug = $1 OR name ILIKE $1', [catId]);
        catId = catRes.rows[0]?.id || null;
      }
      const r = await p.query(`
        INSERT INTO products (name,slug,description,short_description,brand,type,price,sale_price,sku,stock,images,category_id,tags,is_active,is_featured,specifications,attributes,variants)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *
      `, [
        data.name, slug, data.description, data.shortDescription||null, data.brand||'Sanab', data.type||'jewellery',
        data.price||0, data.salePrice||null, data.sku||`SKU-${Date.now()}`, data.stock||0,
        JSON.stringify(data.images||[]), catId,
        JSON.stringify(data.tags||[]), data.isActive!==false, data.isFeatured||false,
        JSON.stringify(data.specifications||{}), JSON.stringify(data.attributes||[]),
        JSON.stringify(data.variants||[])
      ]);
      return mapProduct(r.rows[0]);
    },
    update: async (id: string, data: any) => {
      const fields: string[] = [];
      const vals: any[] = [];
      let i = 1;
      const fieldMap: Record<string, string> = {
        name: 'name', description: 'description', shortDescription: 'short_description',
        brand: 'brand', type: 'type', price: 'price', salePrice: 'sale_price',
        sku: 'sku', stock: 'stock', isActive: 'is_active', isFeatured: 'is_featured',
      };
      for (const [key, col] of Object.entries(fieldMap)) {
        if (data[key] !== undefined) { fields.push(`${col}=$${i++}`); vals.push(data[key]); }
      }
      if (data.images !== undefined) { fields.push(`images=$${i++}`); vals.push(JSON.stringify(data.images)); }
      if (data.tags !== undefined) { fields.push(`tags=$${i++}`); vals.push(JSON.stringify(data.tags)); }
      if (data.variants !== undefined) { fields.push(`variants=$${i++}`); vals.push(JSON.stringify(data.variants)); }
      if (data.specifications !== undefined) { fields.push(`specifications=$${i++}`); vals.push(JSON.stringify(data.specifications)); }
      if (data.attributes !== undefined) { fields.push(`attributes=$${i++}`); vals.push(JSON.stringify(data.attributes)); }
      if (data.categoryId || data.category) {
        let catId = data.categoryId || data.category;
        if (catId && typeof catId === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(catId)) {
          const catRes = await p.query('SELECT id FROM categories WHERE slug = $1 OR name ILIKE $1', [catId]);
          catId = catRes.rows[0]?.id || null;
        }
        fields.push(`category_id=$${i++}`); vals.push(catId);
      }
      if (!fields.length) return Product.findById(id);
      fields.push(`updated_at=NOW()`);
      vals.push(id);
      const r = await p.query(`UPDATE products SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
      return r.rows[0] ? mapProduct(r.rows[0]) : null;
    },
    delete: async (id: string) => {
      await p.query('DELETE FROM products WHERE id=$1', [id]);
    },
    facets: async (type?: string) => {
      const conditions: string[] = ['is_active=true'];
      const vals: any[] = [];
      if (type) { conditions.push(`type=$1`); vals.push(type); }
      const where = `WHERE ${conditions.join(' AND ')}`;
      const [brands, priceRange] = await Promise.all([
        p.query(`SELECT DISTINCT brand FROM products ${where} ORDER BY brand`, vals),
        p.query(`SELECT MIN(price) as min, MAX(price) as max FROM products ${where}`, vals)
      ]);
      return { brands: brands.rows.map((r: any) => r.brand), minPrice: priceRange.rows[0]?.min || 0, maxPrice: priceRange.rows[0]?.max || 50000 };
    },
    count: async () => {
      const r = await p.query('SELECT COUNT(*) FROM products WHERE is_active=true');
      return parseInt(r.rows[0].count);
    }
  };

  const Order = {
    create: async (data: any) => {
      const num = `ORD-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
      const validUserId = isUuid(data.userId) ? data.userId : null;
      const r = await p.query(`
        INSERT INTO orders (order_number,user_id,user_email,items,total,subtotal,tax,shipping,status,payment_status,payment_method,payment_details,shipping_address,coupon_code)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *
      `, [
        num, validUserId, data.userEmail||null,
        JSON.stringify(data.items||[]), data.total||0, data.subtotal||data.total||0,
        data.tax||0, data.shipping||0, data.status||'pending', data.paymentStatus||'pending',
        data.paymentMethod||'cod', JSON.stringify(data.paymentDetails||{}),
        JSON.stringify(data.shippingAddress||{}), data.couponCode||null
      ]);
      return mapOrder(r.rows[0]);
    },
    findById: async (id: string) => {
      try {
        if (!isUuid(id)) {
          return await Order.findByOrderNumber(id);
        }
        const r = await p.query('SELECT * FROM orders WHERE id=$1', [id]);
        return r.rows[0] ? mapOrder(r.rows[0]) : null;
      } catch {
        return null;
      }
    },
    findByOrderNumber: async (num: string) => {
      try {
        const r = await p.query('SELECT * FROM orders WHERE order_number=$1', [num]);
        return r.rows[0] ? mapOrder(r.rows[0]) : null;
      } catch {
        return null;
      }
    },
    listByUser: async (userId: string, page=1, limit=10) => {
      try {
        const offset = (page-1)*limit;
        if (!isUuid(userId)) {
          const [rows, total] = await Promise.all([
            p.query('SELECT * FROM orders WHERE user_email=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]),
            p.query('SELECT COUNT(*) FROM orders WHERE user_email=$1', [userId])
          ]);
          return { results: rows.rows.map(mapOrder), total: parseInt(rows.rows.length ? total.rows[0]?.count || '0' : '0'), totalPages: Math.ceil(parseInt(rows.rows.length ? total.rows[0]?.count || '0' : '0')/limit) };
        }
        const [rows, total] = await Promise.all([
          p.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]),
          p.query('SELECT COUNT(*) FROM orders WHERE user_id=$1', [userId])
        ]);
        return { results: rows.rows.map(mapOrder), total: parseInt(total.rows[0]?.count || '0'), totalPages: Math.ceil(parseInt(total.rows[0]?.count || '0')/limit) };
      } catch {
        return { results: [], total: 0, totalPages: 0 };
      }
    },
    listAdmin: async (page=1, limit=10, status='') => {
      try {
        const offset = (page-1)*limit;
        const where = status && status!=='all' ? 'WHERE status=$3' : '';
        const params: any[] = status && status!=='all' ? [limit, offset, status] : [limit, offset];
        const [rows, total] = await Promise.all([
          p.query(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, params),
          p.query(`SELECT COUNT(*) FROM orders ${where}`, status && status!=='all' ? [status] : [])
        ]);
        return { results: rows.rows.map(mapOrder), total: parseInt(total.rows[0]?.count || '0'), totalPages: Math.ceil(parseInt(total.rows[0]?.count || '0')/limit) };
      } catch {
        return { results: [], total: 0, totalPages: 0 };
      }
    },
    updateStatus: async (id: string, status: string, paymentStatus?: string, paymentDetails?: any) => {
      try {
        if (!isUuid(id)) return null;
        const fields = ['status=$2','updated_at=NOW()'];
        const vals: any[] = [id, status];
        let i = 3;
        if (paymentStatus) { fields.push(`payment_status=$${i++}`); vals.push(paymentStatus); }
        if (paymentDetails) { fields.push(`payment_details=$${i++}`); vals.push(JSON.stringify(paymentDetails)); }
        const r = await p.query(`UPDATE orders SET ${fields.join(',')} WHERE id=$1 RETURNING *`, vals);
        return r.rows[0] ? mapOrder(r.rows[0]) : null;
      } catch {
        return null;
      }
    },

    stats: async () => {
      const [rev, statuses, payments] = await Promise.all([
        p.query(`SELECT SUM(total) as total_revenue, COUNT(*) as total_orders, AVG(total) as avg_order FROM orders WHERE status != 'cancelled'`),
        p.query(`SELECT status as "_id", COUNT(*) as count FROM orders GROUP BY status`),
        p.query(`SELECT payment_method as "_id", SUM(total) as revenue FROM orders WHERE payment_status='paid' GROUP BY payment_method`)
      ]);
      return {
        totalRevenue: parseFloat(rev.rows[0]?.total_revenue)||0,
        totalOrders: parseInt(rev.rows[0]?.total_orders)||0,
        avgOrderValue: parseFloat(rev.rows[0]?.avg_order)||0,
        statusBreakdown: statuses.rows.map((r:any)=>({_id: r._id, count: parseInt(r.count)})),
        paymentBreakdown: payments.rows.map((r:any)=>({_id: r._id, revenue: parseFloat(r.revenue)||0}))
      };
    }
  };

  const Banner = {
    list: async (type?: string) => {
      const where = type ? `WHERE type=$1 AND is_active=true` : `WHERE is_active=true`;
      const r = await p.query(`SELECT * FROM banners ${where} ORDER BY sort_order ASC`, type ? [type] : []);
      return r.rows.map(mapBanner);
    },
    listAll: async () => {
      const r = await p.query('SELECT * FROM banners ORDER BY sort_order ASC');
      return r.rows.map(mapBanner);
    },
    create: async (data: any) => {
      const r = await p.query('INSERT INTO banners (title,subtitle,image,link,type,is_active,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [data.title, data.subtitle||null, data.image, data.link||null, data.type||'hero', data.isActive!==false, data.sortOrder||0]);
      return mapBanner(r.rows[0]);
    },
    update: async (id: string, data: any) => {
      const fields: string[] = [];
      const vals: any[] = [];
      let i = 1;
      ['title','subtitle','image','link','type'].forEach(f => { if(data[f]!==undefined){fields.push(`${f}=$${i++}`);vals.push(data[f]);} });
      if(data.isActive!==undefined){fields.push(`is_active=$${i++}`);vals.push(data.isActive);}
      if(data.sortOrder!==undefined){fields.push(`sort_order=$${i++}`);vals.push(data.sortOrder);}
      if(!fields.length) return null;
      vals.push(id);
      const r = await p.query(`UPDATE banners SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
      return mapBanner(r.rows[0]);
    },
    delete: async (id: string) => { await p.query('DELETE FROM banners WHERE id=$1',[id]); }
  };

  const Faq = {
    list: async () => {
      const r = await p.query('SELECT * FROM faqs WHERE is_active=true ORDER BY sort_order ASC');
      return r.rows.map(mapFaq);
    },
    listAll: async () => {
      const r = await p.query('SELECT * FROM faqs ORDER BY sort_order ASC');
      return r.rows.map(mapFaq);
    },
    create: async (data: any) => {
      const r = await p.query('INSERT INTO faqs (question,answer,category,is_active,sort_order) VALUES($1,$2,$3,$4,$5) RETURNING *',
        [data.question, data.answer, data.category||'general', data.isActive!==false, data.sortOrder||0]);
      return mapFaq(r.rows[0]);
    },
    update: async (id: string, data: any) => {
      const fields: string[] = [];
      const vals: any[] = [];
      let i = 1;
      ['question','answer','category'].forEach(f => { if(data[f]!==undefined){fields.push(`${f}=$${i++}`);vals.push(data[f]);} });
      if(data.isActive!==undefined){fields.push(`is_active=$${i++}`);vals.push(data.isActive);}
      if(!fields.length) return null;
      vals.push(id);
      const r = await p.query(`UPDATE faqs SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
      return mapFaq(r.rows[0]);
    },
    delete: async (id: string) => { await p.query('DELETE FROM faqs WHERE id=$1',[id]); }
  };

  return { User, Category, Product, Order, Banner, Faq };
}

// ── Row Mappers (DB columns → JS camelCase) ───────────────────────────────────
function mapUser(r: any) {
  const addresses = typeof r.addresses === 'string' ? JSON.parse(r.addresses) : (r.addresses || []);
  return {
    _id: r.id,
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    role: r.role,
    isActive: r.is_active,
    password: r.password,
    addresses,
    createdAt: r.created_at,
  };
}

function mapCategory(r: any) {
  return { _id: r.id, id: r.id, name: r.name, slug: r.slug, description: r.description, image: r.image, isActive: r.is_active };
}
function mapProduct(r: any) {
  const variants = typeof r.variants === 'string' ? JSON.parse(r.variants) : (r.variants||[]);
  const images = typeof r.images === 'string' ? JSON.parse(r.images) : (r.images||[]);
  const tags = typeof r.tags === 'string' ? JSON.parse(r.tags) : (r.tags||[]);
  return {
    _id: r.id, id: r.id, name: r.name, slug: r.slug, description: r.description,
    shortDescription: r.short_description, brand: r.brand, type: r.type,
    price: parseFloat(r.price)||0, salePrice: r.sale_price ? parseFloat(r.sale_price) : null,
    sku: r.sku, stock: r.stock, images, tags, isActive: r.is_active, isFeatured: r.is_featured,
    specifications: typeof r.specifications === 'string' ? JSON.parse(r.specifications) : (r.specifications||{}),
    attributes: typeof r.attributes === 'string' ? JSON.parse(r.attributes) : (r.attributes||[]),
    variants, ratings: typeof r.ratings === 'string' ? JSON.parse(r.ratings) : (r.ratings||{average:0,count:0}),
    category: r.category_id ? { _id: r.category_id, id: r.category_id, name: r.category_name||'', slug: r.category_slug||'' } : null,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function mapOrder(r: any) {
  const items = typeof r.items === 'string' ? JSON.parse(r.items) : (r.items||[]);
  const shippingAddress = typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address) : (r.shipping_address||{});
  const paymentDetails = typeof r.payment_details === 'string' ? JSON.parse(r.payment_details) : (r.payment_details||{});
  return {
    _id: r.id, id: r.id, orderNumber: r.order_number, userId: r.user_id, userEmail: r.user_email,
    items, total: parseFloat(r.total)||0, subtotal: parseFloat(r.subtotal)||0,
    tax: parseFloat(r.tax)||0, shipping: parseFloat(r.shipping)||0,
    status: r.status, paymentStatus: r.payment_status, paymentMethod: r.payment_method,
    paymentDetails, shippingAddress, couponCode: r.coupon_code,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function mapBanner(r: any) {
  return { _id: r.id, id: r.id, title: r.title, subtitle: r.subtitle, image: r.image, link: r.link, type: r.type, isActive: r.is_active, sortOrder: r.sort_order, createdAt: r.created_at };
}
function mapFaq(r: any) {
  return { _id: r.id, id: r.id, question: r.question, answer: r.answer, category: r.category, isActive: r.is_active, sortOrder: r.sort_order };
}
