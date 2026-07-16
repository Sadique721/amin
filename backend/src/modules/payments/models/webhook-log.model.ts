import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookLog extends Document {
  provider: 'stripe' | 'razorpay';
  eventId: string;
  payload: Record<string, any>;
  processedStatus: 'success' | 'failed' | 'ignored';
  errorDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookLogSchema = new Schema<IWebhookLog>(
  {
    provider: { type: String, required: true, enum: ['stripe', 'razorpay'] },
    eventId: { type: String, required: true, unique: true, index: true },
    payload: { type: Schema.Types.Map, of: Schema.Types.Mixed, required: true },
    processedStatus: {
      type: String,
      required: true,
      enum: ['success', 'failed', 'ignored'],
    },
    errorDetails: { type: String },
  },
  {
    timestamps: true,
  }
);

export const WebhookLog = mongoose.model<IWebhookLog>('WebhookLog', WebhookLogSchema);
