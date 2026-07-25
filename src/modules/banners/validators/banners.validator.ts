import { query } from 'express-validator';

/**
 * Banners request validators (express-validator chains).
 */
export const bannersHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
