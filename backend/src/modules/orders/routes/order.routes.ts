import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware, optionalAuthMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import {
  createOrderSchema,
  verifyRazorpayPaymentSchema,
  verifyCodPaymentSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator';

const router = Router();
const controller = new OrderController();

// Guest / User Order Creation (optional auth)
router.post('/', optionalAuthMiddleware, validationMiddleware(createOrderSchema), controller.createOrder);

// Admin Order Actions (registered before /:id)
router.get('/admin/list', authMiddleware, adminMiddleware, controller.listAllOrdersAdmin);
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, validationMiddleware(updateOrderStatusSchema), controller.updateOrderStatusAdmin);
router.get('/admin/stats', authMiddleware, adminMiddleware, controller.getSalesStatsAdmin);

// User Order Actions (require auth)
router.post('/verify/razorpay', authMiddleware, validationMiddleware(verifyRazorpayPaymentSchema), controller.verifyRazorpayPayment);
router.post('/verify/cod', authMiddleware, validationMiddleware(verifyCodPaymentSchema), controller.verifyCodPayment);
router.get('/my-orders', authMiddleware, controller.listUserOrders);
router.get('/:id', authMiddleware, controller.getOrderById);

export default router;
