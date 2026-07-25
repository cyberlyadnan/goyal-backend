import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { usersController } from '../controllers/users.controller.js';
import { usersHealthValidators } from '../validators/users.validator.js';

const router = Router();

/**
 * @openapi
 * /users/health:
 *   get:
 *     tags: [Users]
 *     summary: Users module health (scaffold)
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
  validate(usersHealthValidators),
  catchAsync(usersController.health),
);

export default router;
