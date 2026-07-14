import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import {
  createOrderSchema,
  verifyRazorpayPaymentSchema,
  verifyCodPaymentSchema,
} from '../validators/order.validator';

const router = Router();
const controller = new OrderController();

router.use(authMiddleware);

router.post('/', validationMiddleware(createOrderSchema), controller.createOrder);
router.post('/verify/razorpay', validationMiddleware(verifyRazorpayPaymentSchema), controller.verifyRazorpayPayment);
router.post('/verify/cod', validationMiddleware(verifyCodPaymentSchema), controller.verifyCodPayment);
router.get('/my-orders', controller.listUserOrders);
router.get('/:id', controller.getOrderById);

export default router;
