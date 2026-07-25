import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { requestOtpSchema, verifyOtpSchema, googleLoginSchema } from '../validators/auth.validator';
import { rateLimitMiddleware } from '@/middlewares/rate-limit.middleware';

const router = Router();
const controller = new AuthController();

const otpRateLimiter = rateLimitMiddleware(5, 15 * 60 * 1000); // 5 requests per 15 mins
const googleRateLimiter = rateLimitMiddleware(20, 15 * 60 * 1000); // 20 requests per 15 mins

router.post('/otp/send', otpRateLimiter, validationMiddleware(requestOtpSchema), controller.requestOtp);
router.post('/otp/verify', otpRateLimiter, validationMiddleware(verifyOtpSchema), controller.verifyOtp);
router.post('/google', googleRateLimiter, validationMiddleware(googleLoginSchema), controller.googleLogin);

export default router;

