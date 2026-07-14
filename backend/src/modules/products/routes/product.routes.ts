import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();
const controller = new ProductController();

router.get('/', controller.searchProducts);
router.get('/facets', controller.getFacets);
router.get('/slug/:slug', controller.getProductBySlug);
router.get('/:id', controller.getProductById);

router.post('/', authMiddleware, adminMiddleware, validationMiddleware(createProductSchema), controller.createProduct);
router.patch('/:id', authMiddleware, adminMiddleware, validationMiddleware(updateProductSchema), controller.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deleteProduct);

export default router;
