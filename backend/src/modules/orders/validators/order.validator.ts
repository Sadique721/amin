import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string({ required_error: 'Product ID is required' }),
        sku: z.string({ required_error: 'SKU is required' }),
        quantity: z.number({ required_error: 'Quantity is required' }).min(1),
      })
    ).min(1, 'Order must contain at least one item'),
    shippingAddress: z.object({
      fullName: z.string({ required_error: 'Full name is required' }).trim(),
      addressLine1: z.string({ required_error: 'Address line 1 is required' }).trim(),
      addressLine2: z.string().trim().optional(),
      city: z.string({ required_error: 'City is required' }).trim(),
      state: z.string({ required_error: 'State is required' }).trim(),
      postalCode: z.string({ required_error: 'Postal code is required' }).trim(),
      country: z.string({ required_error: 'Country is required' }).trim(),
      phone: z.string({ required_error: 'Phone number is required' }).trim(),
    }),
    couponCode: z.string().trim().optional(),
    paymentMethod: z.enum(['razorpay', 'cod', 'authorize_net', 'card']).default('cod'),
    paymentDetails: z.object({
      cardholderName: z.string().optional(),
      cardLast4: z.string().optional(),
      cardNumber: z.string().optional(),
    }).optional(),
  }),
});

export const verifyRazorpayPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string({ required_error: 'Razorpay order ID is required' }),
    razorpayPaymentId: z.string({ required_error: 'Razorpay payment ID is required' }),
    razorpaySignature: z.string({ required_error: 'Razorpay signature is required' }),
  }),
});

export const verifyCodPaymentSchema = z.object({
  body: z.object({
    orderId: z.string({ required_error: 'Order ID is required' }),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
      required_error: 'Status is required',
    }),
    paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
  }),
});
