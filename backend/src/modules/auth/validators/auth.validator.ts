import { z } from 'zod';

export const requestOtpSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address'),
});

export const verifyOtpSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address'),
  otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be exactly 6 characters'),
});

export const googleLoginSchema = z.object({
  credential: z.string({ required_error: 'Google credential is required' }),
});

export type RequestOtpDTO = z.infer<typeof requestOtpSchema>;
export type VerifyOtpDTO = z.infer<typeof verifyOtpSchema>;
export type GoogleLoginDTO = z.infer<typeof googleLoginSchema>;
