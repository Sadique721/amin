import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { updateUserValidationSchema, addressValidationSchema } from '../validators/user.validator';

const router = Router();
const controller = new UserController();

router.use(authMiddleware);

router.get('/profile', controller.getProfile);
router.patch('/profile', validationMiddleware(updateUserValidationSchema), controller.updateProfile);
router.post('/addresses', validationMiddleware(addressValidationSchema), controller.addAddress);
router.delete('/addresses/:addressId', controller.deleteAddress);
router.patch('/addresses/:addressId/default', controller.setDefaultAddress);

export default router;
