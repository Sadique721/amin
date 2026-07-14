import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string({ required_error: 'Coupon code is required' }).toUpperCase().trim().min(3, 'Code must be at least 3 characters'),
    discountType: z.enum(['percentage', 'fixed'], { required_error: 'Discount type is required' }),
    discountValue: z.number({ required_error: 'Discount value is required' }).min(0),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    startDate: z.string({ required_error: 'Start date is required' }).transform((val) => new Date(val)),
    endDate: z.string({ required_error: 'End date is required' }).transform((val) => new Date(val)),
    usageLimit: z.number().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCouponSchema = z.object({
  body: z.object({
    code: z.string().toUpperCase().trim().min(3).optional(),
    discountType: z.enum(['percentage', 'fixed']).optional(),
    discountValue: z.number().min(0).optional(),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    startDate: z.string().transform((val) => new Date(val)).optional(),
    endDate: z.string().transform((val) => new Date(val)).optional(),
    usageLimit: z.number().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string({ required_error: 'Coupon code is required' }).trim(),
    orderAmount: z.number({ required_error: 'Order amount is required' }).min(0),
  }),
});
