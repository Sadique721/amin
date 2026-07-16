import { z } from 'zod';

export const emailSchema = z.string().min(1, 'Email is required').trim().email('Invalid email address');
export const otpSchema = z.string().min(1, 'OTP is required').length(6, 'OTP must be exactly 6 digits');

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().min(1, 'Email is required').trim().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
