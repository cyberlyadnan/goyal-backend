import { query } from 'express-validator';

/**
 * Offers request validators (express-validator chains).
 */
export const offersHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
