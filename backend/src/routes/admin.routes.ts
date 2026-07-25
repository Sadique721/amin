import { Router } from 'express';
import { dashboardRoutes } from '@/modules/dashboard';

const router = Router();

router.use('/dashboard', dashboardRoutes);

export default router;
