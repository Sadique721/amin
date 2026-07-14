import mongoose, { Schema, Document, Model } from 'mongoose';
import { slugPlugin } from '@/database/plugins/slug.plugin';
import { paginatePlugin } from '@/database/plugins/paginate.plugin';

export interface IVariant {
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributes: Record<string, string | number>;
  images?: string[];
  isActive: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  brand: string;
  images: string[];
  ratingsAverage: number;
  ratingsQuantity: number;
  tags: string[];
  isActive: boolean;
  type: 'jewellery' | 'cosmetics';
  specifications: Record<string, any>;
  variants: IVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductModel extends Model<IProduct> {
  paginate(filter: any, options: any): Promise<any>;
}

const VariantSchema = new Schema<IVariant>({
  sku: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  compareAtPrice: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  attributes: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {},
  },
  images: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['jewellery', 'cosmetics'],
    },
    specifications: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    variants: {
      type: [VariantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index(
  {
    name: 'text',
    brand: 'text',
    description: 'text',
    tags: 'text',
  },
  {
    weights: {
      name: 10,
      brand: 5,
      tags: 3,
      description: 1,
    },
    name: 'ProductTextIndex',
  }
);

ProductSchema.plugin(slugPlugin, { sourceField: 'name', slugField: 'slug' });
ProductSchema.plugin(paginatePlugin);

export const Product = mongoose.model<IProduct, IProductModel>('Product', ProductSchema);
