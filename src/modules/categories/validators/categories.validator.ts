import { query } from 'express-validator';

/**
 * Categories request validators (express-validator chains).
 */
export const categoriesHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
