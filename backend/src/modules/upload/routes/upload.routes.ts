import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';

const router = Router();
const controller = new UploadController();

// Multer memory storage configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post('/single', authMiddleware, adminMiddleware, upload.single('file'), controller.uploadSingle);
router.post('/delete', authMiddleware, adminMiddleware, controller.deleteAsset);

export default router;
