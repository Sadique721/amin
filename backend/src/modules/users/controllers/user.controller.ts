import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '@/shared/api/ApiResponse';
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';

export class UserController {
  private userService = new UserService();

  getProfile = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const user = await this.userService.getProfile(userId);
      res.status(200).json(new ApiResponse(200, user, 'Profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const user = await this.userService.updateProfile(userId, req.body);
      res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  addAddress = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const addresses = await this.userService.addAddress(userId, req.body);
      res.status(200).json(new ApiResponse(200, addresses, 'Address added successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteAddress = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const { addressId } = req.params;
      const addresses = await this.userService.deleteAddress(userId, addressId);
      res.status(200).json(new ApiResponse(200, addresses, 'Address deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  setDefaultAddress = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const { addressId } = req.params;
      const addresses = await this.userService.setDefaultAddress(userId, addressId);
      res.status(200).json(new ApiResponse(200, addresses, 'Default address set successfully'));
    } catch (error) {
      next(error);
    }
  };

  getSessions = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const sessions = await this.userService.getSessions(userId);
      res.status(200).json(new ApiResponse(200, sessions, 'Active sessions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const { sessionId } = req.params;
      await this.userService.revokeSession(userId, sessionId);
      res.status(200).json(new ApiResponse(200, null, 'Session revoked successfully'));
    } catch (error) {
      next(error);
    }
  };
}
