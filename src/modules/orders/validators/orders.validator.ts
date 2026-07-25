import { query } from 'express-validator';

/**
 * Orders request validators (express-validator chains).
 */
export const ordersHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
