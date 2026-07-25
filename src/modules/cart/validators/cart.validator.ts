import { query } from 'express-validator';

/**
 * Cart request validators (express-validator chains).
 */
export const cartHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
