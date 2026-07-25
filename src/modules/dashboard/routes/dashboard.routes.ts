import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { dashboardHealthValidators } from '../validators/dashboard.validator.js';

const router = Router();

/**
 * @openapi
 * /dashboard/health:
 *   get:
 *     tags: [Dashboard]
 *     summary: Dashboard module health (scaffold)
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
  validate(dashboardHealthValidators),
  catchAsync(dashboardController.health),
);

export default router;
