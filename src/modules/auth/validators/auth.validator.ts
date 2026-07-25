import { query } from 'express-validator';

/**
 * Auth request validators (express-validator chains).
 */
export const authHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
