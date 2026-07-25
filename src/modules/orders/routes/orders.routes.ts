import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { ordersController } from '../controllers/orders.controller.js';
import { ordersHealthValidators } from '../validators/orders.validator.js';

const router = Router();

/**
 * @openapi
 * /orders/health:
 *   get:
 *     tags: [Orders]
 *     summary: Orders module health (scaffold)
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
  validate(ordersHealthValidators),
  catchAsync(ordersController.health),
);

export default router;
