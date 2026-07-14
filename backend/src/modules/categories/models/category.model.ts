import mongoose, { Schema, Document, Model } from 'mongoose';
import { slugPlugin } from '@/database/plugins/slug.plugin';
import { paginatePlugin } from '@/database/plugins/paginate.plugin';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: mongoose.Types.ObjectId | ICategory | null;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryModel extends Model<ICategory> {
  paginate(filter: any, options: any): Promise<any>;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    image: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.plugin(slugPlugin, { sourceField: 'name', slugField: 'slug' });
CategorySchema.plugin(paginatePlugin);

export const Category = mongoose.model<ICategory, ICategoryModel>('Category', CategorySchema);
