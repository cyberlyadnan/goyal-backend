import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { productsController } from '../controllers/products.controller.js';
import { productsHealthValidators } from '../validators/products.validator.js';

const router = Router();

/**
 * @openapi
 * /products/health:
 *   get:
 *     tags: [Products]
 *     summary: Products module health (scaffold)
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
  validate(productsHealthValidators),
  catchAsync(productsController.health),
);

export default router;
