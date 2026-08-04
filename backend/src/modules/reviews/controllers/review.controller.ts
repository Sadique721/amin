import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { ApiResponse } from '@/shared/api/ApiResponse';
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';

export class ReviewController {
  private reviewService = new ReviewService();

  createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const review = await this.reviewService.createReview(userId, req.body);
      res.status(201).json(new ApiResponse(201, { review }, 'Review submitted successfully'));
    } catch (error) {
      next(error);
    }
  };

  getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = req.params.productId;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const result = await this.reviewService.getProductReviews(productId, { page, limit });
      res.status(200).json(new ApiResponse(200, result, 'Product reviews retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const reviewId = req.params.id;

      const result = await this.reviewService.deleteReview(reviewId, userId);
      res.status(200).json(new ApiResponse(200, result, 'Review deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
