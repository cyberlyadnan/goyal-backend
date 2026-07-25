import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { paymentsController } from '../controllers/payments.controller.js';
import { paymentsHealthValidators } from '../validators/payments.validator.js';

const router = Router();

/**
 * @openapi
 * /payments/health:
 *   get:
 *     tags: [Payments]
 *     summary: Payments module health (scaffold)
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
  validate(paymentsHealthValidators),
  catchAsync(paymentsController.health),
);

export default router;
