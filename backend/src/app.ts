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

import { corsConfig } from './config/cors.config';

const app = express();

// Security Middlewares
app.use(helmet());

// Configure CORS
app.use(cors(corsConfig));


// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'storage/uploads')));

// HTTP Request Logger
app.use(morgan('dev'));

// Root Route Landing
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✨ SANAB Luxury Atelier REST API Service is running',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// Base API Routes Mount with general rate limiting
app.use('/api', rateLimitMiddleware(200, 15 * 60 * 1000), router);

// Error Handling Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
