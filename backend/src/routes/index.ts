import { Router } from 'express';
import publicRoutes from './public.routes';
import adminRoutes from './admin.routes';
import { ApiResponse } from '@/shared/api/ApiResponse';

const router = Router();

// Health Check route
router.get('/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, { uptime: process.uptime() }, 'API is healthy and running'));
});

// Aggregate routes
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);

export default router;
