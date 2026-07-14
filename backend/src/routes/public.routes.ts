import { Router } from 'express';
import { authRoutes } from '@/modules/auth';
import { userRoutes } from '@/modules/users';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
