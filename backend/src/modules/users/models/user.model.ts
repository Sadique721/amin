import mongoose, { Document, Schema, Model } from 'mongoose';
import { paginatePlugin } from '@/database/plugins/paginate.plugin';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  isActive: boolean;
  isEmailVerified: boolean;
  googleId?: string;
  password?: string;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

interface IUserModel extends Model<IUser> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<any>;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, default: 'India', trim: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['customer', 'admin', 'staff'],
      default: 'customer',
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    googleId: { type: String },
    password: { type: String },
    addresses: [AddressSchema],
  },
  {
    timestamps: true,
  }
);

// Apply plugins
UserSchema.plugin(paginatePlugin);

export const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
