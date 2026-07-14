import { z } from 'zod';

export const emailSchema = z.string().min(1, 'Email is required').trim().email('Invalid email address');
export const otpSchema = z.string().min(1, 'OTP is required').length(6, 'OTP must be exactly 6 digits');
