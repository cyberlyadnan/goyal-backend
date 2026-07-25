import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { authController } from '../controllers/auth.controller.js';
import { authHealthValidators } from '../validators/auth.validator.js';

const router = Router();

/**
 * @openapi
 * /auth/health:
 *   get:
 *     tags: [Auth]
 *     summary: Auth module health (scaffold)
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
  validate(authHealthValidators),
  catchAsync(authController.health),
);

export default router;
