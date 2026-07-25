import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { offersController } from '../controllers/offers.controller.js';
import { offersHealthValidators } from '../validators/offers.validator.js';

const router = Router();

/**
 * @openapi
 * /offers/health:
 *   get:
 *     tags: [Offers]
 *     summary: Offers module health (scaffold)
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
  validate(offersHealthValidators),
  catchAsync(offersController.health),
);

export default router;
