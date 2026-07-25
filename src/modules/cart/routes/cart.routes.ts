import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { cartController } from '../controllers/cart.controller.js';
import { cartHealthValidators } from '../validators/cart.validator.js';

const router = Router();

/**
 * @openapi
 * /cart/health:
 *   get:
 *     tags: [Cart]
 *     summary: Cart module health (scaffold)
 *     security: []
 *     responses:
 *       200:
 *         description: Module scaffold is reachable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.get(
  '/health',
  validate(cartHealthValidators),
  catchAsync(cartController.health),
);

export default router;
