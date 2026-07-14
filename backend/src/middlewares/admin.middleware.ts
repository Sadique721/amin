import { Request, Response, NextFunction } from 'express';
import { ForbiddenException, UnauthorizedException } from '@/shared/exceptions';
import { AuthenticatedRequest } from './auth.middleware';

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return next(new UnauthorizedException('Authentication required'));
  }

  if (authReq.user.role !== 'admin') {
    return next(new ForbiddenException('Access denied: Administrator privileges required'));
  }

  next();
};
