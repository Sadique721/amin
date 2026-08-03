import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { updateUserValidationSchema, addAddressSchema } from '../validators/user.validator';

const router = Router();
const controller = new UserController();

router.use(authMiddleware);

router.get('/profile', controller.getProfile);
router.patch('/profile', validationMiddleware(updateUserValidationSchema), controller.updateProfile);
router.post('/addresses', validationMiddleware(addAddressSchema), controller.addAddress);

router.delete('/addresses/:addressId', controller.deleteAddress);
router.patch('/addresses/:addressId/default', controller.setDefaultAddress);
router.get('/sessions', controller.getSessions);
router.delete('/sessions/:sessionId', controller.revokeSession);

export default router;
