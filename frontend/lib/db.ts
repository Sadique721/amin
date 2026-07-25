import mongoose, { Schema, Document, model, models } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ── Connection ────────────────────────────────────────────────────────────────
let isConnected = false;
const DEFAULT_MONGO_URI = 'mongodb+srv://haquedot:Rq8XL4BO8Gkf5szC@cluster0.mongodb.net/sanab?retryWrites=true&w=majority';

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;
  try {
    await mongoose.connect(uri, { bufferCommands: false, maxPoolSize: 5 });
    isConnected = true;
  } catch (e) {
    console.error('MongoDB connection error:', e);
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

export { connectDB, bcrypt };

// ── Schemas ───────────────────────────────────────────────────────────────────

// User
interface IUser extends Document {
  name: string; email: string; phone?: string; password: string;
  role: 'user' | 'admin'; isActive: boolean; createdAt: Date;
}
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Category
interface ICategory extends Document {
  name: string; slug: string; description?: string; image?: string;
  parentCategory?: mongoose.Types.ObjectId; isActive: boolean;
}
const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Product
interface IProduct extends Document {
  name: string; slug: string; description: string; shortDescription?: string;
  price: number; salePrice?: number; sku: string; stock: number;
  images: string[]; category: mongoose.Types.ObjectId;
  tags?: string[]; isActive: boolean; isFeatured?: boolean;
  attributes?: { name: string; value: string }[];
  ratings?: { average: number; count: number };
}
const productSchema = new Schema<IProduct>({
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

// Order
interface IOrder extends Document {
  user: mongoose.Types.ObjectId; orderNumber: string;
  items: { product: mongoose.Types.ObjectId; name: string; price: number; quantity: number; image?: string }[];
  total: number; subtotal: number; tax: number; shipping: number;
  status: string; paymentStatus: string; paymentMethod: string;
  shippingAddress: { name: string; phone: string; address: string; city: string; state: string; pincode: string; country: string };
  createdAt: Date;
}
const orderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  items: [{ product: { type: Schema.Types.ObjectId, ref: 'Product' }, name: String, price: Number, quantity: Number, image: String }],
  total: Number, subtotal: Number, tax: Number, shipping: Number,
  status: { type: String, default: 'pending' },
  paymentStatus: { type: String, default: 'pending' },
  paymentMethod: { type: String, default: 'cod' },
  shippingAddress: { name: String, phone: String, address: String, city: String, state: String, pincode: String, country: String },
}, { timestamps: true });

// Models (prevent re-compilation in serverless)
export const User = (models.User as mongoose.Model<IUser>) || model<IUser>('User', userSchema);
export const Category = (models.Category as mongoose.Model<ICategory>) || model<ICategory>('Category', categorySchema);
export const Product = (models.Product as mongoose.Model<IProduct>) || model<IProduct>('Product', productSchema);
export const Order = (models.Order as mongoose.Model<IOrder>) || model<IOrder>('Order', orderSchema);
