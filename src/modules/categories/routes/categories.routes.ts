import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { categoriesController } from '../controllers/categories.controller.js';
import { categoriesHealthValidators } from '../validators/categories.validator.js';

const router = Router();

/**
 * @openapi
 * /categories/health:
 *   get:
 *     tags: [Categories]
 *     summary: Categories module health (scaffold)
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
  validate(categoriesHealthValidators),
  catchAsync(categoriesController.health),
);

export default router;
