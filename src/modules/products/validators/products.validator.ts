import { query } from 'express-validator';

/**
 * Products request validators (express-validator chains).
 */
export const productsHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
