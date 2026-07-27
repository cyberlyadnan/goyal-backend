import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { authorize } from '../../../middleware/role.middleware.js';
import { validateZod } from '../../../middleware/validateZod.middleware.js';
import { ROLES } from '../../../constants/roles.constant.js';
import { cartController } from '../controllers/cart.controller.js';
import {
  addToCartSchema,
  removeCartItemParamsSchema,
  updateCartSchema,
} from '../validators/cart.validator.js';

const router = Router();
const retailerOnly = [
  authenticate,
  authorize(ROLES.RETAILER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
];

router.get('/', ...retailerOnly, catchAsync(cartController.getCart));

router.post(
  '/add',
  ...retailerOnly,
  validateZod(addToCartSchema),
  catchAsync(cartController.addItem),
);

router.put(
  '/update',
  ...retailerOnly,
  validateZod(updateCartSchema),
  catchAsync(cartController.updateItem),
);

router.delete(
  '/remove/:productId',
  ...retailerOnly,
  validateZod(removeCartItemParamsSchema, 'params'),
  catchAsync(cartController.removeItem),
);

router.delete('/clear', ...retailerOnly, catchAsync(cartController.clearCart));

export default router;
