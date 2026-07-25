import { query } from 'express-validator';

/**
 * Notifications request validators (express-validator chains).
 */
export const notificationsHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
