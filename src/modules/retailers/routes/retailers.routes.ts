import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { retailersController } from '../controllers/retailers.controller.js';
import { retailersHealthValidators } from '../validators/retailers.validator.js';

const router = Router();

/**
 * @openapi
 * /retailers/health:
 *   get:
 *     tags: [Retailers]
 *     summary: Retailers module health (scaffold)
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
  validate(retailersHealthValidators),
  catchAsync(retailersController.health),
);

export default router;
