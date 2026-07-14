import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
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

router.use(authMiddleware);

// User Order Actions
router.post('/', validationMiddleware(createOrderSchema), controller.createOrder);
router.post('/verify/razorpay', validationMiddleware(verifyRazorpayPaymentSchema), controller.verifyRazorpayPayment);
router.post('/verify/cod', validationMiddleware(verifyCodPaymentSchema), controller.verifyCodPayment);
router.get('/my-orders', controller.listUserOrders);
router.get('/:id', controller.getOrderById);

// Admin Order Actions
router.get('/admin/list', adminMiddleware, controller.listAllOrdersAdmin);
router.patch('/admin/:id/status', adminMiddleware, validationMiddleware(updateOrderStatusSchema), controller.updateOrderStatusAdmin);
router.get('/admin/stats', adminMiddleware, controller.getSalesStatsAdmin);

export default router;
