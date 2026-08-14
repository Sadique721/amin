import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { addToWishlistSchema } from '../validators/wishlist.validator';

const router = Router();
const controller = new WishlistController();

router.use(authMiddleware);

router.get('/', controller.getWishlist);
router.post('/', validationMiddleware(addToWishlistSchema), controller.addToWishlist);
router.delete('/:productId', controller.removeFromWishlist);

export default router;
