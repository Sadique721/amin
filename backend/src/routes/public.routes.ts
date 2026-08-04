import { Router } from 'express';
import { authRoutes } from '@/modules/auth';
import { userRoutes } from '@/modules/users';
import { categoryRoutes } from '@/modules/categories';
import { productRoutes } from '@/modules/products';
import { couponRoutes } from '@/modules/coupons';
import { orderRoutes } from '@/modules/orders';
import { uploadRoutes } from '@/modules/upload';
import { cmsRoutes } from '@/modules/cms';
import { wishlistRoutes } from '@/modules/wishlist';
import { paymentRoutes } from '@/modules/payments';
import { reviewRoutes } from '@/modules/reviews';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/coupons', couponRoutes);
router.use('/orders', orderRoutes);
router.use('/upload', uploadRoutes);
router.use('/cms', cmsRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);

export default router;
