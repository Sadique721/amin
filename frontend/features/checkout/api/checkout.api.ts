import { api } from '@/services/axios';

export interface ICreateOrderInput {
  items: {
    productId: string;
    sku: string;
    quantity: number;
  }[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  couponCode?: string;
  paymentMethod: 'razorpay' | 'cod';
}

export async function createOrderApi(input: ICreateOrderInput) {
  const response = await api.post('/orders', input);
  return response.data;
}

export async function verifyRazorpayPaymentApi(paymentData: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const response = await api.post('/orders/verify/razorpay', paymentData);
  return response.data;
}

export async function verifyCodPaymentApi(orderId: string) {
  const response = await api.post('/orders/verify/cod', { orderId });
  return response.data;
}

export async function fetchOrderByIdApi(id: string) {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}

export async function fetchUserOrdersApi(page: number = 1, limit: number = 10) {
  const response = await api.get('/orders/my-orders', {
    params: { page, limit },
  });
  return response.data;
}

export async function fetchAdminOrdersApi(page: number = 1, limit: number = 10, status?: string) {
  const response = await api.get('/orders/admin/list', {
    params: { page, limit, status },
  });
  return response.data;
}

export async function updateOrderStatusAdminApi(
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  paymentStatus?: 'pending' | 'paid' | 'failed'
) {
  const response = await api.patch(`/orders/admin/${orderId}/status`, {
    status,
    paymentStatus,
  });
  return response.data;
}

export async function fetchSalesStatsApi() {
  const response = await api.get('/orders/admin/stats');
  return response.data;
}
