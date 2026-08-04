import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();
const controller = new ReviewController();

// Public routes
router.get('/product/:productId', controller.getProductReviews);

// Protected routes (User authentication required)
router.post('/', authMiddleware, validationMiddleware(createReviewSchema), controller.createReview);
router.delete('/:id', authMiddleware, controller.deleteReview);

export default router;
