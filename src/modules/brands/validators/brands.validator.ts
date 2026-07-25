import { query } from 'express-validator';

/**
 * Brands request validators (express-validator chains).
 */
export const brandsHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
