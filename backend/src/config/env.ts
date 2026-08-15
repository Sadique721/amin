import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables conditionally from .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

const envSchema = z.object({
  PORT: z.coerce.number().default(2800),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().optional(),
  POSTGRES_HOST: z.string().optional(),
  POSTGRES_PORT: z.coerce.number().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),
  POSTGRES_CA_CERT: z.string().optional(),
  POSTGRES_CA_PATH: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  AUTHORIZE_NET_API_LOGIN_ID: z.string().optional(),
  AUTHORIZE_NET_TRANSACTION_KEY: z.string().optional(),
  AUTHORIZE_NET_ENVIRONMENT: z.enum(['SANDBOX', 'PRODUCTION']).default('SANDBOX'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:2637'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(2637),
  KAFKA_BROKERS: z.string().default('localhost:2909'),
  KAFKA_CLIENT_ID: z.string().default('amin-backend'),
  KAFKA_GROUP_ID: z.string().default('amin-consumers'),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  MAX_COD_AMOUNT: z.coerce.number().default(5000),
});

const parseEnv = () => {
  const envVars = { ...process.env };

  // Allow safe dev/test defaults if missing, but throw in production
  if (!envVars.JWT_SECRET) {
    if (nodeEnv === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!');
    }
    envVars.JWT_SECRET = 'dev_only_jwt_secret_do_not_use_in_production_12345';
  }

  if (!envVars.JWT_REFRESH_SECRET) {
    if (nodeEnv === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_REFRESH_SECRET environment variable is missing in production!');
    }
    envVars.JWT_REFRESH_SECRET = 'dev_only_refresh_secret_do_not_use_in_production_12345';
  }

  const result = envSchema.safeParse(envVars);
  if (!result.success) {
    console.error('❌ Env validation failed:', JSON.stringify(result.error.format(), null, 2));
    throw new Error('Invalid environment configuration');
  }
  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
