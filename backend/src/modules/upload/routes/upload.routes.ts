import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { deleteAssetSchema } from '../validators/upload.validator';

const router = Router();
const controller = new UploadController();

// Multer memory storage configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'));
    }
  },
});

router.post('/single', authMiddleware, adminMiddleware, upload.single('file'), (req, res, next) => {
  // Capture multer error specifically if needed, otherwise defer to global handler
  next();
}, controller.uploadSingle);
router.post('/delete', authMiddleware, adminMiddleware, validationMiddleware(deleteAssetSchema), controller.deleteAsset);

export default router;
