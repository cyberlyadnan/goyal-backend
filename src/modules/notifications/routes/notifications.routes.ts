import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { notificationsController } from '../controllers/notifications.controller.js';
import { notificationsHealthValidators } from '../validators/notifications.validator.js';

const router = Router();

/**
 * @openapi
 * /notifications/health:
 *   get:
 *     tags: [Notifications]
 *     summary: Notifications module health (scaffold)
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
  validate(notificationsHealthValidators),
  catchAsync(notificationsController.health),
);

export default router;
