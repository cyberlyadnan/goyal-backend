import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validateZod } from '../../../middleware/validateZod.middleware.js';
import { authController } from '../controllers/auth.controller.js';
import {
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../validators/auth.validator.js';

const router = Router();

/**
 * @openapi
 * /auth/send-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Send login OTP to a registered mobile number
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobile]
 *             properties:
 *               mobile: { type: string, example: "9999999999" }
 *               role: { type: string, enum: [admin, retailer] }
 *     responses:
 *       200:
 *         description: OTP generated (logged to console until SMS is wired)
 */
router.post(
  '/send-otp',
  validateZod(sendOtpSchema),
  catchAsync(authController.sendOtp),
);

/**
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and issue JWT tokens
 *     security: []
 */
router.post(
  '/verify-otp',
  validateZod(verifyOtpSchema),
  catchAsync(authController.verifyOtp),
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate access + refresh tokens
 *     security: []
 */
router.post(
  '/refresh',
  validateZod(refreshTokenSchema),
  catchAsync(authController.refresh),
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Invalidate the current refresh token
 */
router.post('/logout', authenticate, catchAsync(authController.logout));

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the authenticated user profile
 */
router.get('/me', authenticate, catchAsync(authController.me));

export default router;
