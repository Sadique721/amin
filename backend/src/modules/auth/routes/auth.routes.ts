import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { requestOtpSchema, verifyOtpSchema, googleLoginSchema } from '../validators/auth.validator';

const router = Router();
const controller = new AuthController();

router.post('/otp/send', validationMiddleware(requestOtpSchema), controller.requestOtp);
router.post('/otp/verify', validationMiddleware(verifyOtpSchema), controller.verifyOtp);
router.post('/google', validationMiddleware(googleLoginSchema), controller.googleLogin);

export default router;
