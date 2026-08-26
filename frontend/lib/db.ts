import mongoose from 'mongoose';

// JWT secrets loaded securely
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!');
    }
    return 'dev_only_jwt_secret_do_not_use_in_production_12345';
  }
  return secret;
};

const getJwtRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_REFRESH_SECRET environment variable is missing in production!');
    }
    return 'dev_only_refresh_secret_do_not_use_in_production_12345';
  }
  return secret;
};

const JWT_SECRET = getJwtSecret();
const JWT_REFRESH = getJwtRefreshSecret();

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

// ── MongoDB/Mongoose Connection ────────────────────────────────────────────────
let cachedConnection: typeof mongoose | null = null;

export async function connectDB(): Promise<any> {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing');
  }
  cachedConnection = await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB via Mongoose');
  return cachedConnection;
}

// Dummy getPool function returning a mock to prevent imports failure in route.ts
export function getPool() {
  return {
    query: async () => {
      throw new Error('PostgreSQL raw query is disabled. Using MongoDB.');
    }
  };
}

// Mongoose Schema Definitions
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  addresses: { type: Array, default: [] },
  isActive: { type: Boolean, default: true },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
  avatar: { type: String },
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  brand: { type: String, default: 'Amin' },
  type: { type: String, default: 'jewellery' },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  sku: { type: String, required: true },
  stock: { type: Number, default: 0 },
  images: { type: [String], default: [] },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  specifications: { type: Object, default: {} },
  attributes: { type: Array, default: [] },
  variants: { type: Array, default: [] },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  userId: { type: String },
  userEmail: { type: String },
  items: { type: Array, default: [] },
  total: { type: Number, required: true },
  subtotal: { type: Number },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  paymentStatus: { type: String, default: 'pending' },
  paymentMethod: { type: String, default: 'cod' },
  paymentDetails: { type: Object, default: {} },
  shippingAddress: { type: Object, default: {} },
  couponCode: { type: String },
}, { timestamps: true });

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  type: { type: String, default: 'hero' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const FaqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'general' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
}, { timestamps: true });

// Compile models securely (avoid recompilation in hot reloads)
const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const BannerModel = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
const FaqModel = mongoose.models.Faq || mongoose.model('Faq', FaqSchema);
const OtpModel = mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
const WishlistModel = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);

// Mappers to ensure the client-facing APIs receive camelCase properties
function mapUser(doc: any) {
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    isActive: doc.isActive,
    password: doc.password,
    addresses: doc.addresses || [],
    avatar: doc.avatar,
    createdAt: doc.createdAt,
    resetToken: doc.resetToken,
    resetTokenExpires: doc.resetTokenExpires,
  };
}

function mapCategory(doc: any) {
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    image: doc.image,
    isActive: doc.isActive,
  };
}

function mapProduct(doc: any) {
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    shortDescription: doc.shortDescription,
    brand: doc.brand,
    type: doc.type,
    price: doc.price,
    salePrice: doc.salePrice,
    sku: doc.sku,
    stock: doc.stock,
    images: doc.images || [],
    tags: doc.tags || [],
    isActive: doc.isActive,
    isFeatured: doc.isFeatured,
    specifications: doc.specifications || {},
    attributes: doc.attributes || [],
    variants: doc.variants || [],
    ratings: doc.ratings || { average: 0, count: 0 },
    category: doc.category ? (typeof doc.category === 'object' && doc.category._id ? {
      _id: doc.category._id.toString(),
      id: doc.category._id.toString(),
      name: doc.category.name || '',
      slug: doc.category.slug || ''
    } : { _id: doc.category.toString(), id: doc.category.toString(), name: '', slug: '' }) : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function mapOrder(doc: any) {
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    orderNumber: doc.orderNumber,
    userId: doc.userId,
    userEmail: doc.userEmail,
    items: doc.items || [],
    total: doc.total,
    subtotal: doc.subtotal,
    tax: doc.tax,
    shipping: doc.shipping,
    status: doc.status,
    paymentStatus: doc.paymentStatus,
    paymentMethod: doc.paymentMethod,
    paymentDetails: doc.paymentDetails || {},
    shippingAddress: doc.shippingAddress || {},
    couponCode: doc.couponCode,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function mapBanner(doc: any) {
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    title: doc.title,
    subtitle: doc.subtitle,
    image: doc.image,
    link: doc.link,
    type: doc.type,
    isActive: doc.isActive,
    sortOrder: doc.sortOrder,
    createdAt: doc.createdAt,
  };
}

function mapFaq(doc: any) {
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    question: doc.question,
    answer: doc.answer,
    category: doc.category,
    isActive: doc.isActive,
    sortOrder: doc.sortOrder,
  };
}

export async function getModels() {
  await connectDB();

  const User = {
    findByEmail: async (email: string) => {
      const u = await UserModel.findOne({ email: email.toLowerCase().trim() });
      return u ? mapUser(u) : null;
    },
    findById: async (id: string) => {
      try {
        const u = await UserModel.findById(id);
        return u ? mapUser(u) : null;
      } catch {
        return null;
      }
    },
    create: async (data: any) => {
      const _bcrypt = await getBcrypt();
      const hashedPassword = await _bcrypt.hash(data.password, 10);
      const u = await UserModel.create({
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        password: hashedPassword,
        role: data.role || 'user',
        isActive: data.isActive !== undefined ? data.isActive : true,
        addresses: data.addresses || [],
        avatar: data.avatar || '',
      });
      return mapUser(u);
    },
    update: async (id: string, data: any) => {
      try {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim();
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.password !== undefined) {
          const _bcrypt = await getBcrypt();
          updateData.password = await _bcrypt.hash(data.password, 10);
        }
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.resetToken !== undefined) updateData.resetToken = data.resetToken;
        if (data.resetTokenExpires !== undefined) updateData.resetTokenExpires = data.resetTokenExpires;
        if (data.avatar !== undefined) updateData.avatar = data.avatar;
        
        const u = await UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        return u ? mapUser(u) : null;
      } catch {
        return null;
      }
    },
    count: async () => {
      return await UserModel.countDocuments();
    },
    list: async (page = 1, limit = 10, search = '') => {
      const query: any = {};
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ];
      }
      const [docs, total] = await Promise.all([
        UserModel.find(query).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
        UserModel.countDocuments(query)
      ]);
      return { results: docs.map(mapUser), total };
    },
    findByResetToken: async (token: string) => {
      const u = await UserModel.findOne({ resetToken: token, resetTokenExpires: { $gt: new Date() } });
      return u ? mapUser(u) : null;
    }
  };

  const Category = {
    list: async () => {
      const docs = await CategoryModel.find({}).sort({ name: 1 });
      return docs.map(mapCategory);
    },
    findById: async (id: string) => {
      try {
        const c = await CategoryModel.findById(id);
        return c ? mapCategory(c) : null;
      } catch {
        return null;
      }
    },
    create: async (data: any) => {
      const c = await CategoryModel.create({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        image: data.image,
        isActive: data.isActive !== undefined ? data.isActive : true
      });
      return mapCategory(c);
    },
    update: async (id: string, data: any) => {
      try {
        const updateData: any = {};
        ['name', 'slug', 'description', 'image', 'isActive'].forEach(k => {
          if (data[k] !== undefined) updateData[k] = data[k];
        });
        const c = await CategoryModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        return c ? mapCategory(c) : null;
      } catch {
        return null;
      }
    },
    delete: async (id: string) => {
      try {
        await CategoryModel.findByIdAndDelete(id);
      } catch {}
    }
  };

  const Product = {
    list: async (page = 1, limit = 10, category = '', search = '', minPrice = 0, maxPrice = 9999999, type = '', sort = '') => {
      const query: any = {
        isActive: true
      };
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }
      if (category && category !== 'all') {
        if (mongoose.Types.ObjectId.isValid(category)) {
          query.category = new mongoose.Types.ObjectId(category);
        } else {
          const catDoc = await CategoryModel.findOne({ slug: category.toLowerCase().trim() });
          if (catDoc) {
            query.category = catDoc._id;
          } else {
            query.category = new mongoose.Types.ObjectId();
          }
        }
      }
      if (type && type !== 'all') {
        query.type = type;
      }
      query.price = { $gte: minPrice, $lte: maxPrice };

      let sortOption: any = { createdAt: -1 };
      if (sort === 'price_asc') sortOption = { price: 1 };
      if (sort === 'price_desc') sortOption = { price: -1 };
      if (sort === 'rating') sortOption = { 'ratings.average': -1 };

      const [docs, total] = await Promise.all([
        ProductModel.find(query).populate('category').sort(sortOption).skip((page - 1) * limit).limit(limit),
        ProductModel.countDocuments(query)
      ]);
      return { results: docs.map(mapProduct), total, totalPages: Math.ceil(total / limit) };
    },
    findById: async (id: string) => {
      try {
        const p = await ProductModel.findById(id).populate('category');
        return p ? mapProduct(p) : null;
      } catch {
        return null;
      }
    },
    findBySlug: async (slug: string) => {
      const p = await ProductModel.findOne({ slug: slug.toLowerCase().trim() }).populate('category');
      return p ? mapProduct(p) : null;
    },
    create: async (data: any) => {
      const catId = data.category_id || data.categoryId || data.category;
      const p = await ProductModel.create({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        shortDescription: data.shortDescription,
        brand: data.brand || 'Amin',
        type: data.type || 'jewellery',
        price: data.price,
        salePrice: data.salePrice,
        sku: data.sku,
        stock: data.stock || 0,
        images: data.images || [],
        category: catId ? new mongoose.Types.ObjectId(catId) : undefined,
        tags: data.tags || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        isFeatured: data.isFeatured || false,
        specifications: data.specifications || {},
        attributes: data.attributes || [],
        variants: data.variants || [],
        ratings: data.ratings || { average: 0, count: 0 }
      });
      return mapProduct(p);
    },
    update: async (id: string, data: any) => {
      try {
        const updateData: any = {};
        const fields = ['name', 'slug', 'description', 'shortDescription', 'brand', 'type', 'price', 'salePrice', 'sku', 'stock', 'images', 'tags', 'isActive', 'isFeatured', 'specifications', 'attributes', 'variants', 'ratings'];
        fields.forEach(f => {
          if (data[f] !== undefined) updateData[f] = data[f];
        });
        const catId = data.category_id || data.categoryId || data.category;
        if (catId !== undefined) {
          updateData.category = catId ? new mongoose.Types.ObjectId(catId) : null;
        }

        const p = await ProductModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).populate('category');
        return p ? mapProduct(p) : null;
      } catch {
        return null;
      }
    },
    delete: async (id: string) => {
      try {
        await ProductModel.findByIdAndDelete(id);
      } catch {}
    },
    deductStock: async (productId: string, sku: string, quantity: number) => {
      const p = await ProductModel.findById(productId);
      if (!p) throw new Error('Product not found for stock deduction');
      if (p.stock < quantity) throw new Error(`Insufficient stock for product ${p.name}`);
      
      p.stock -= quantity;
      
      if (p.variants && p.variants.length > 0) {
        p.variants = p.variants.map((v: any) => {
          if (v.sku === sku) {
            v.stock = Math.max(0, (v.stock || 0) - quantity);
          }
          return v;
        });
      }
      
      p.markModified('variants');
      await p.save();
      return true;
    }
  };

  const Order = {
    create: async (data: any) => {
      const num = data.orderNumber || `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const o = await OrderModel.create({
        orderNumber: num,
        userId: data.userId,
        userEmail: data.userEmail,
        items: data.items || [],
        total: data.total,
        subtotal: data.subtotal,
        tax: data.tax || 0,
        shipping: data.shipping || 0,
        status: data.status || 'pending',
        paymentStatus: data.paymentStatus || 'pending',
        paymentMethod: data.paymentMethod || 'cod',
        paymentDetails: data.paymentDetails || {},
        shippingAddress: data.shippingAddress || {},
        couponCode: data.couponCode
      });
      return mapOrder(o);
    },
    findById: async (id: string) => {
      try {
        let o = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
          o = await OrderModel.findById(id);
        }
        if (!o) {
          o = await OrderModel.findOne({ orderNumber: id });
        }
        return o ? mapOrder(o) : null;
      } catch {
        return null;
      }
    },
    findByOrderNumber: async (num: string) => {
      const o = await OrderModel.findOne({ orderNumber: num });
      return o ? mapOrder(o) : null;
    },
    findByRazorpayOrderId: async (rzpOrderId: string) => {
      const o = await OrderModel.findOne({ 'paymentDetails.razorpayOrderId': rzpOrderId });
      return o ? mapOrder(o) : null;
    },
    listByUser: async (userId: string, page = 1, limit = 10) => {
      const query: any = {
        $or: [
          { userId: userId },
          { userEmail: userId }
        ]
      };
      const [docs, total] = await Promise.all([
        OrderModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        OrderModel.countDocuments(query)
      ]);
      return { results: docs.map(mapOrder), total, totalPages: Math.ceil(total / limit) };
    },
    listAdmin: async (page = 1, limit = 10, status = '') => {
      const query: any = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      const [docs, total] = await Promise.all([
        OrderModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        OrderModel.countDocuments(query)
      ]);
      return { results: docs.map(mapOrder), total, totalPages: Math.ceil(total / limit) };
    },
    updateStatus: async (id: string, status: string, paymentStatus: string, paymentDetails: any) => {
      try {
        const updateData: any = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (paymentDetails) updateData.paymentDetails = paymentDetails;
        const o = await OrderModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        return o ? mapOrder(o) : null;
      } catch {
        return null;
      }
    },
    stats: async () => {
      const [orders, productsCount, usersCount] = await Promise.all([
        OrderModel.find({}),
        ProductModel.countDocuments({ isActive: true }),
        UserModel.countDocuments()
      ]);
      
      let totalRevenue = 0;
      let totalOrders = orders.length;
      let pendingOrders = 0;
      let processingOrders = 0;
      let shippedOrders = 0;
      let deliveredOrders = 0;
      let cancelledOrders = 0;

      orders.forEach((o: any) => {
        if (o.paymentStatus === 'paid') {
          totalRevenue += o.total;
        }
        if (o.status === 'pending') pendingOrders++;
        else if (o.status === 'processing') processingOrders++;
        else if (o.status === 'shipped') shippedOrders++;
        else if (o.status === 'delivered') deliveredOrders++;
        else if (o.status === 'cancelled') cancelledOrders++;
      });

      const salesChart = [
        { name: 'Jan', sales: 0 },
        { name: 'Feb', sales: 0 },
        { name: 'Mar', sales: 0 },
        { name: 'Apr', sales: 0 },
        { name: 'May', sales: 0 },
        { name: 'Jun', sales: totalRevenue }
      ];

      return {
        totalRevenue,
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        productsCount,
        usersCount,
        salesChart
      };
    }
  };

  const Banner = {
    list: async () => {
      const docs = await BannerModel.find({ isActive: true }).sort({ sortOrder: 1 });
      return docs.map(mapBanner);
    },
    create: async (data: any) => {
      const b = await BannerModel.create({
        title: data.title,
        subtitle: data.subtitle,
        image: data.image,
        link: data.link,
        type: data.type || 'hero',
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder || 0
      });
      return mapBanner(b);
    },
    update: async (id: string, data: any) => {
      try {
        const updateData: any = {};
        ['title', 'subtitle', 'image', 'link', 'type', 'isActive', 'sortOrder'].forEach(k => {
          if (data[k] !== undefined) updateData[k] = data[k];
        });
        const b = await BannerModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        return b ? mapBanner(b) : null;
      } catch {
        return null;
      }
    },
    delete: async (id: string) => {
      try {
        await BannerModel.findByIdAndDelete(id);
      } catch {}
    }
  };

  const Faq = {
    list: async () => {
      const docs = await FaqModel.find({ isActive: true }).sort({ sortOrder: 1 });
      return docs.map(mapFaq);
    },
    create: async (data: any) => {
      const f = await FaqModel.create({
        question: data.question,
        answer: data.answer,
        category: data.category || 'general',
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder || 0
      });
      return mapFaq(f);
    },
    update: async (id: string, data: any) => {
      try {
        const updateData: any = {};
        ['question', 'answer', 'category', 'isActive', 'sortOrder'].forEach(k => {
          if (data[k] !== undefined) updateData[k] = data[k];
        });
        const f = await FaqModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        return f ? mapFaq(f) : null;
      } catch {
        return null;
      }
    },
    delete: async (id: string) => {
      try {
        await FaqModel.findByIdAndDelete(id);
      } catch {}
    }
  };

  const Otp = {
    save: async (email: string, code: string) => {
      const cleanEmail = email.toLowerCase().trim();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await OtpModel.findOneAndUpdate(
        { email: cleanEmail },
        { code: code.trim(), expiresAt },
        { upsert: true, new: true }
      );
    },
    verify: async (email: string, code: string) => {
      const cleanEmail = email.toLowerCase().trim();
      const doc = await OtpModel.findOne({ email: cleanEmail, code: code.trim(), expiresAt: { $gt: new Date() } });
      if (doc) {
        await OtpModel.deleteOne({ email: cleanEmail });
        return true;
      }
      return false;
    }
  };

  const Wishlist = {
    list: async (userId: string) => {
      const docs = await WishlistModel.find({ userId }).populate('product');
      return docs
        .filter(d => d.product)
        .map(d => mapProduct(d.product));
    },
    add: async (userId: string, productId: string) => {
      const existing = await WishlistModel.findOne({ userId, product: new mongoose.Types.ObjectId(productId) });
      if (existing) return existing;
      const w = await WishlistModel.create({
        userId,
        product: new mongoose.Types.ObjectId(productId)
      });
      return w;
    },
    remove: async (userId: string, productId: string) => {
      await WishlistModel.deleteOne({ userId, product: new mongoose.Types.ObjectId(productId) });
      return true;
    }
  };

  return { User, Category, Product, Order, Banner, Faq, Otp, Wishlist };
}
