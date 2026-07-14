import { Schema, model, Document } from 'mongoose';

export interface IFaq extends Document {
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Faq = model<IFaq>('Faq', FaqSchema);
