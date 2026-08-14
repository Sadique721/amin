import { z } from 'zod';

export const createRazorpayOrderSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
});

export const verifyRazorpayPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'razorpayOrderId is required'),
  razorpayPaymentId: z.string().min(1, 'razorpayPaymentId is required'),
  razorpaySignature: z.string().min(1, 'razorpaySignature is required'),
  orderId: z.string().optional(),
});

export const chargeAuthorizeNetSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  cardNumber: z.string().min(13, 'Card number must be at least 13 digits').max(19, 'Card number max 19 digits'),
  expirationDate: z.string().min(4, 'Expiration date is required (MMYY or MM/YY)'),
  cardCode: z.string().min(3, 'CVV/Card code must be 3 or 4 digits').max(4, 'CVV/Card code max 4 digits'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional(),
  description: z.string().optional(),
});
