import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { authorize } from '../../../middleware/role.middleware.js';
import { validateZod } from '../../../middleware/validateZod.middleware.js';
import { ROLES } from '../../../constants/roles.constant.js';
import { cartController } from '../controllers/cart.controller.js';
import { checkoutSchema } from '../validators/cart.validator.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.RETAILER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validateZod(checkoutSchema),
  catchAsync(cartController.checkout),
);

export default router;
