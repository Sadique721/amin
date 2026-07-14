import { IProduct, IVariant } from '@/features/products';

export interface ICartItem {
  product: IProduct;
  variant: IVariant;
  quantity: number;
}

export interface ICoupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface CartState {
  items: ICartItem[];
  coupon: ICoupon | null;
  discountAmount: number;
  loading: boolean;
  couponError: string | null;
}
