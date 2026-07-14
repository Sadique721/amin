import { Router } from 'express';
import { authRoutes } from '@/modules/auth';
import { userRoutes } from '@/modules/users';
import { categoryRoutes } from '@/modules/categories';
import { productRoutes } from '@/modules/products';
import { couponRoutes } from '@/modules/coupons';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/coupons', couponRoutes);

export default router;
