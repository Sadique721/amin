import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

const router = Router();
const controller = new CategoryController();

router.get('/', controller.getAllCategories);
router.get('/:slug', controller.getCategoryBySlug);

router.post('/', authMiddleware, adminMiddleware, validationMiddleware(createCategorySchema), controller.createCategory);
router.patch('/:id', authMiddleware, adminMiddleware, validationMiddleware(updateCategorySchema), controller.updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deleteCategory);

export default router;
