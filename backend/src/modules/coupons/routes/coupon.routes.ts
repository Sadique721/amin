import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from '../validators/coupon.validator';

const router = Router();
const controller = new CouponController();

router.post('/validate', validationMiddleware(validateCouponSchema), controller.validateCoupon);

router.post('/', authMiddleware, adminMiddleware, validationMiddleware(createCouponSchema), controller.createCoupon);
router.patch('/:id', authMiddleware, adminMiddleware, validationMiddleware(updateCouponSchema), controller.updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deleteCoupon);
router.get('/', authMiddleware, adminMiddleware, controller.listCoupons);

export default router;
