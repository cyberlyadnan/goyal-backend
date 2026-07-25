import { Router } from 'express';
import { ApiResponse } from '../utils/ApiResponse.js';
import { MESSAGES } from '../constants/index.js';
import {
  authRoutes,
  usersRoutes,
  retailersRoutes,
  brandsRoutes,
  categoriesRoutes,
  productsRoutes,
  cartRoutes,
  ordersRoutes,
  paymentsRoutes,
  notificationsRoutes,
  bannersRoutes,
  offersRoutes,
  dashboardRoutes,
} from '../modules/index.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: API health check
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', (_req, res) => {
  return ApiResponse.ok(res, MESSAGES.HEALTH_OK, {
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/retailers', retailersRoutes);
router.use('/brands', brandsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/banners', bannersRoutes);
router.use('/offers', offersRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
