import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

// Create Razorpay Order (Authenticated User)
router.post('/create-order', authMiddleware, PaymentController.createRazorpayOrder);

// Verify Razorpay Payment Signature (Authenticated User)
router.post('/verify', authMiddleware, PaymentController.verifyRazorpayPayment);

// Razorpay Webhook Endpoint (Public webhook listener)
router.post('/webhook', PaymentController.handleRazorpayWebhook);

export default router;
