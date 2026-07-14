import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/shared/api/ApiError';
import { env } from '@/config/env';
import { logger } from '@/shared/logger';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  if (env.NODE_ENV === 'development' || !error.isOperational) {
    logger.error(`${req.method} ${req.originalUrl} - ${error.stack || error.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.message}`);
  }

  res.status(error.statusCode).json(response);
};
