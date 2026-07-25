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
      await mongoose.connect(uri, { bufferCommands: false, maxPoolSize: 5 });
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

  const productSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: String,
    price: { type: Number, required: true },
    salePrice: Number,
    sku: { type: String, required: true },
    stock: { type: Number, default: 0 },
    images: [String],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [String],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    attributes: [{ name: String, value: String }],
    ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  }, { timestamps: true });

  const orderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [{ product: { type: Schema.Types.ObjectId, ref: 'Product' }, name: String, price: Number, quantity: Number, image: String }],
    total: Number, subtotal: Number, tax: Number, shipping: Number,
    status: { type: String, default: 'pending' },
    paymentStatus: { type: String, default: 'pending' },
    paymentMethod: { type: String, default: 'cod' },
    shippingAddress: { name: String, phone: String, address: String, city: String, state: String, pincode: String, country: String },
  }, { timestamps: true });

  const User = models.User || model('User', userSchema);
  const Category = models.Category || model('Category', categorySchema);
  const Product = models.Product || model('Product', productSchema);
  const Order = models.Order || model('Order', orderSchema);

  return { User, Category, Product, Order, mongoose };
}
