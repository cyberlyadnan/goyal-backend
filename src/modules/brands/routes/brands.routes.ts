import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { brandsController } from '../controllers/brands.controller.js';
import { brandsHealthValidators } from '../validators/brands.validator.js';

const router = Router();

/**
 * @openapi
 * /brands/health:
 *   get:
 *     tags: [Brands]
 *     summary: Brands module health (scaffold)
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
  validate(brandsHealthValidators),
  catchAsync(brandsController.health),
);

export default router;
