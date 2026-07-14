import { Request, Response, NextFunction } from 'express';
import { NotFoundException } from '@/shared/exceptions';

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(new NotFoundException(`Route not found - ${req.originalUrl}`));
};
