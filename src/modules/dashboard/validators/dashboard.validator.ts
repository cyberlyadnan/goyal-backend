import { query } from 'express-validator';

/**
 * Dashboard request validators (express-validator chains).
 */
export const dashboardHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
