import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { bannersController } from '../controllers/banners.controller.js';
import { bannersHealthValidators } from '../validators/banners.validator.js';

const router = Router();

/**
 * @openapi
 * /banners/health:
 *   get:
 *     tags: [Banners]
 *     summary: Banners module health (scaffold)
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
  validate(bannersHealthValidators),
  catchAsync(bannersController.health),
);

export default router;
