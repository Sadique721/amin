import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';
import { connectDB } from './database/connection';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazily connect to database on request (crucial for serverless environments)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// HTTP Request Logger
app.use(morgan('dev'));

// Base API Routes Mount
app.use('/api', router);

// Error Handling Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
