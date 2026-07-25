import { query } from 'express-validator';

/**
 * Retailers request validators (express-validator chains).
 */
export const retailersHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
