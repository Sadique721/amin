import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/shared/auth/jwt';
import { env } from '@/config/env';
import { UnauthorizedException } from '@/shared/exceptions';
import { UserRepository } from '@/modules/users/repositories/user.repository';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'customer' | 'admin' | 'staff';
  };
}

export interface IJwtPayload {
  sub: string;
  role?: 'customer' | 'admin' | 'staff';
  email?: string;
  iat?: number;
  exp?: number;
}

const userRepository = new UserRepository();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    let payload: IJwtPayload;
    try {
      payload = verifyToken(token, env.JWT_SECRET) as unknown as IJwtPayload;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired token';
      throw new UnauthorizedException(msg);
    }

    const userId = payload.sub;
    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive or does not exist');
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
