import { api } from '@/services/axios';

export async function validateCouponApi(code: string, orderAmount: number) {
  const response = await api.post('/coupons/validate', { code, orderAmount });
  return response.data;
}
