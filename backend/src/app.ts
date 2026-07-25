import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';
import { connectDB } from './database/connection';
import { env } from './config/env';
import { rateLimitMiddleware } from './middlewares/rate-limit.middleware';
import path from 'path';

const app = express();

// Security Middlewares
app.use(helmet());

// Configure CORS
const allowedOrigins = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : '*';
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'storage/uploads')));

// HTTP Request Logger
app.use(morgan('dev'));

// Base API Routes Mount with general rate limiting
app.use('/api', rateLimitMiddleware(200, 15 * 60 * 1000), router);

// Error Handling Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
