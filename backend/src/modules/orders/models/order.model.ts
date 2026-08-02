import mongoose, { Schema, Document, Model } from 'mongoose';
import { paginatePlugin } from '@/database/plugins/paginate.plugin';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant: {
    sku: string;
    price: number;
    attributes: Record<string, string | number>;
  };
  quantity: number;
}

export interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IPaymentDetails {
  method: 'stripe' | 'razorpay' | 'cod' | 'authorize_net' | 'card';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  cardholderName?: string;
  cardLast4?: string;
  paymentIntentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentDetails: IPaymentDetails;
  coupon?: mongoose.Types.ObjectId;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderModel extends Model<IOrder> {
  paginate(filter: any, options: any): Promise<any>;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        variant: {
          sku: { type: String, required: true },
          price: { type: Number, required: true },
          attributes: { type: Map, of: Schema.Types.Mixed },
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentDetails: {
      method: {
        type: String,
        required: true,
        enum: ['stripe', 'razorpay', 'cod', 'authorize_net', 'card'],
      },
      status: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: { type: String },
      cardholderName: { type: String },
      cardLast4: { type: String },
      paymentIntentId: { type: String },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'paymentDetails.razorpayOrderId': 1 }, { unique: true, sparse: true });
OrderSchema.index({ 'paymentDetails.paymentIntentId': 1 }, { unique: true, sparse: true });

OrderSchema.plugin(paginatePlugin);

export const Order = mongoose.model<IOrder, IOrderModel>('Order', OrderSchema);
