import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '@/shared/api/ApiResponse';

export class AuthController {
  private authService = new AuthService();

  requestOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.authService.requestOtp(email);
      res.status(200).json(new ApiResponse(200, null, 'OTP sent successfully to your email'));
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const result = await this.authService.verifyOtp(email, otp);
      res.status(200).json(new ApiResponse(200, result, 'Authentication successful'));
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { credential } = req.body;
      const result = await this.authService.googleLogin(credential);
      res.status(200).json(new ApiResponse(200, result, 'Google login successful'));
    } catch (error) {
      next(error);
    }
  };
}
