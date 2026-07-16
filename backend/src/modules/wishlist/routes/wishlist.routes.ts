import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new WishlistController();

router.use(authMiddleware);

router.get('/', controller.getWishlist);
router.post('/', controller.addToWishlist);
router.delete('/:productId', controller.removeFromWishlist);

export default router;
