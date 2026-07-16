import { Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlist.service';
import { ApiResponse } from '@/shared/api/ApiResponse';
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';

export class WishlistController {
  private wishlistService = new WishlistService();

  getWishlist = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const wishlist = await this.wishlistService.getWishlist(userId);
      res.status(200).json(new ApiResponse(200, wishlist, 'Wishlist retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  addToWishlist = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const { productId } = req.body;
      const wishlist = await this.wishlistService.addToWishlist(userId, productId);
      res.status(200).json(new ApiResponse(200, wishlist, 'Product added to wishlist successfully'));
    } catch (error) {
      next(error);
    }
  };

  removeFromWishlist = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const { productId } = req.params;
      const wishlist = await this.wishlistService.removeFromWishlist(userId, productId);
      res.status(200).json(new ApiResponse(200, wishlist, 'Product removed from wishlist successfully'));
    } catch (error) {
      next(error);
    }
  };
}
