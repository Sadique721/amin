import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryLedger extends Document {
  variantSku: string;
  changeQuantity: number;
  reason: 'PURCHASE' | 'RESTOCK' | 'REFUND' | 'SHIPPING_LOSS';
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryLedgerSchema = new Schema<IInventoryLedger>(
  {
    variantSku: { type: String, required: true, index: true },
    changeQuantity: { type: Number, required: true },
    reason: {
      type: String,
      required: true,
      enum: ['PURCHASE', 'RESTOCK', 'REFUND', 'SHIPPING_LOSS'],
    },
    referenceId: { type: String },
  },
  {
    timestamps: true,
  }
);

export const InventoryLedger = mongoose.model<IInventoryLedger>('InventoryLedger', InventoryLedgerSchema);
