import jwt from 'jsonwebtoken';

export interface SignOptions {
  expiresIn?: string | number;
}

export function signToken(payload: Record<string, any>, secret: string, options: SignOptions = {}): string {
  const expiresIn = options.expiresIn ? (options.expiresIn as jwt.SignOptions['expiresIn']) : '1h';
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn,
  });
}

export function verifyToken(token: string, secret: string): Record<string, any> {
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    });
    if (typeof decoded === 'string') {
      throw new Error('Invalid token payload');
    }
    return decoded as Record<string, any>;
  } catch (err: any) {
    throw new Error(err.message || 'JWT verification failed');
  }
}

