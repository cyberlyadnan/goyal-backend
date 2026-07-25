import { query } from 'express-validator';

/**
 * Payments request validators (express-validator chains).
 */
export const paymentsHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
