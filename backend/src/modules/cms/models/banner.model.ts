import { Schema, model, Document } from 'mongoose';

export interface IBanner extends Document {
  title?: string;
  subtitle?: string;
  desktopImage: {
    url: string;
    publicId: string;
  };
  mobileImage?: {
    url: string;
    publicId: string;
  };
  linkUrl?: string;
  order: number;
  isActive: boolean;
  type: 'hero' | 'promotional' | 'grid';
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    desktopImage: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    mobileImage: {
      url: { type: String },
      publicId: { type: String },
    },
    linkUrl: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    type: { type: String, enum: ['hero', 'promotional', 'grid'], default: 'hero' },
  },
  { timestamps: true }
);

export const Banner = model<IBanner>('Banner', BannerSchema);
