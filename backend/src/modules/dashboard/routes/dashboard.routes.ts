import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';

const router = Router();

// Protect with Auth + Admin Role Check
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', DashboardController.getOverviewStats);

export default router;
