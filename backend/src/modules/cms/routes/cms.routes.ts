import { Router } from 'express';
import { CmsController } from '../controllers/cms.controller';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';
import {
  createBannerSchema,
  updateBannerSchema,
  createFaqSchema,
  updateFaqSchema,
} from '../validators/cms.validator';

const router = Router();
const controller = new CmsController();

// Public routes
router.get('/banners', controller.getActiveBanners);
router.get('/faqs', controller.getActiveFaqs);

// Admin protected routes
router.post(
  '/banners',
  authMiddleware,
  adminMiddleware,
  validationMiddleware(createBannerSchema),
  controller.createBanner
);
router.get('/banners/all', authMiddleware, adminMiddleware, controller.getAllBanners);
router.get('/banners/:id', authMiddleware, adminMiddleware, controller.getBannerById);
router.put(
  '/banners/:id',
  authMiddleware,
  adminMiddleware,
  validationMiddleware(updateBannerSchema),
  controller.updateBanner
);
router.delete('/banners/:id', authMiddleware, adminMiddleware, controller.deleteBanner);

router.post(
  '/faqs',
  authMiddleware,
  adminMiddleware,
  validationMiddleware(createFaqSchema),
  controller.createFaq
);
router.get('/faqs/all', authMiddleware, adminMiddleware, controller.getAllFaqs);
router.get('/faqs/:id', authMiddleware, adminMiddleware, controller.getFaqById);
router.put(
  '/faqs/:id',
  authMiddleware,
  adminMiddleware,
  validationMiddleware(updateFaqSchema),
  controller.updateFaq
);
router.delete('/faqs/:id', authMiddleware, adminMiddleware, controller.deleteFaq);

export default router;
