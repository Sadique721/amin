import { z } from 'zod';

export const requestOtpSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address'),
    otp: z.string({ required_error: 'OTP/Password is required' }).min(1, 'OTP/Password is required'),
  }),
});

export const googleLoginSchema = z.object({
  body: z.object({
    credential: z.string({ required_error: 'Google credential is required' }),
  }),
});

export type RequestOtpDTO = z.infer<typeof requestOtpSchema>['body'];
export type VerifyOtpDTO = z.infer<typeof verifyOtpSchema>['body'];
export type GoogleLoginDTO = z.infer<typeof googleLoginSchema>['body'];
