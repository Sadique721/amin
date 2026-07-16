import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  deviceInfo: {
    ip: string;
    userAgent: string;
    os?: string;
    browser?: string;
  };
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    deviceInfo: {
      ip: { type: String, required: true },
      userAgent: { type: String, required: true },
      os: { type: String },
      browser: { type: String },
    },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model<ISession>('Session', SessionSchema);
