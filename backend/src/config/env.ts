import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load env files — .env.production is bundled with Vercel serverless function
dotenv.config({ path: path.join(__dirname, '../../../.env.production') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/sanab'),
  JWT_SECRET: z.string().default('fallback_jwt_secret_change_in_production'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z.string().default('fallback_refresh_secret_change_in_production'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // Log warning but DON'T exit — Vercel serverless functions must not call process.exit()
    console.warn('⚠️ Env config warnings:', JSON.stringify(result.error.format()));
    // Return with defaults for missing fields
    return envSchema.parse({
      ...process.env,
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sanab',
      JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    });
  }
  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
