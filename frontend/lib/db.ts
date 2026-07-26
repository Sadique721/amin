import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ── Lazy Mongoose connection ──────────────────────────────────────────────────
let isConnected = false;
let mongooseRef: any = null;
const DEFAULT_MONGO_URI = 'mongodb+srv://haquedot:Rq8XL4BO8Gkf5szC@cluster0.mongodb.net/sanab?retryWrites=true&w=majority';

export async function connectDB() {
  if (isConnected && mongooseRef?.connection?.readyState === 1) return mongooseRef;
  const uri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;
  try {
    const { default: mongoose } = await import('mongoose');
    mongooseRef = mongoose;
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 5000 });
    }
    isConnected = true;
    return mongoose;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    return null;
  }
}

// ── JWT helpers ───────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'sanab_production_jwt_secret_2026';
const JWT_REFRESH = process.env.JWT_REFRESH_SECRET || 'sanab_production_refresh_secret_2026';

export function signAccess(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}
export function signRefresh(payload: object) {
  return jwt.sign(payload, JWT_REFRESH, { expiresIn: '7d' });
}
export function verifyAccess(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}

export { bcrypt };

// Helper to get Mongoose models lazily
export async function getModels() {
  const { default: mongoose, Schema, model, models } = await import('mongoose');

  const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: String,
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });

  const categorySchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });

  // Extended product schema supporting variants, brand, type, specifications
  const variantSchema = new Schema({
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: Number,
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    attributes: { type: Schema.Types.Mixed, default: {} },
    images: [String],
  }, { _id: false });

  const productSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: String,
    brand: { type: String, default: 'Sanab' },
    type: { type: String, enum: ['jewellery', 'cosmetics', 'other'], default: 'jewellery' },
    price: { type: Number, required: true },
    salePrice: Number,
    sku: { type: String, required: true },
    stock: { type: Number, default: 0 },
    images: [String],
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [String],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    specifications: { type: Schema.Types.Mixed, default: {} },
    attributes: [{ name: String, value: String }],
    variants: [variantSchema],
    ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  }, { timestamps: true });

  // Extended order schema - orderNumber auto-generated, no longer required from caller
  const orderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userId: String, // fallback string user ID
    orderNumber: { type: String, default: () => 'ORD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase() },
    items: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      productId: String,
      sku: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    }],
    total: { type: Number, default: 0 },
    subtotal: Number,
    tax: Number,
    shipping: Number,
    status: { type: String, default: 'pending' },
    paymentStatus: { type: String, default: 'pending' },
    paymentMethod: { type: String, default: 'cod' },
    paymentDetails: {
      method: String,
      status: { type: String, default: 'pending' },
      transactionId: String,
      authCode: String,
      razorpayOrderId: String,
      razorpayPaymentId: String,
    },
    shippingAddress: {
      fullName: String,
      name: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
      pincode: String,
      country: String,
    },
    couponCode: String,
  }, { timestamps: true });

  const User = models.User || model('User', userSchema);
  const Category = models.Category || model('Category', categorySchema);
  const Product = models.Product || model('Product', productSchema);
  const Order = models.Order || model('Order', orderSchema);

  return { User, Category, Product, Order, mongoose };
}
