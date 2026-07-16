import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '@/shared/api/ApiResponse';

export class AuthController {
  private authService = new AuthService();

  requestOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const data = await this.authService.requestOtp(email);
      res.status(200).json(new ApiResponse(200, data, 'OTP request processed successfully'));
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const result = await this.authService.verifyOtp(email, otp, { ip, userAgent });
      res.status(200).json(new ApiResponse(200, result, 'Authentication successful'));
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { credential } = req.body;
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const result = await this.authService.googleLogin(credential, { ip, userAgent });
      res.status(200).json(new ApiResponse(200, result, 'Google login successful'));
    } catch (error) {
      next(error);
    }
  };
}
