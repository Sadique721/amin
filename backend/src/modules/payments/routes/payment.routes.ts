import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

// ─── Razorpay ────────────────────────────────────────────────────────────────
// Create Razorpay Order (Authenticated User)
router.post('/create-order', authMiddleware, PaymentController.createRazorpayOrder);

// Verify Razorpay Payment Signature (Authenticated User)
router.post('/verify', authMiddleware, PaymentController.verifyRazorpayPayment);

// Razorpay Webhook Endpoint (Public webhook listener)
router.post('/webhook', PaymentController.handleRazorpayWebhook);

// ─── Authorize.Net ───────────────────────────────────────────────────────────
// Charge card via Authorize.Net (Authenticated User)
router.post('/authorizenet/charge', authMiddleware, PaymentController.chargeAuthorizeNet);

// Authorize.Net Silent Post Webhook (Public — called by Authorize.Net servers)
router.post('/authorizenet/webhook', PaymentController.handleAuthorizeNetWebhook);

export default router;
