import { query } from 'express-validator';

/**
 * Users request validators (express-validator chains).
 */
export const usersHealthValidators = [
  query('verbose').optional().isBoolean().withMessage('verbose must be a boolean'),
];
