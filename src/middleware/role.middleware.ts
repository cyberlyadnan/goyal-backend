import type { NextFunction, Response } from 'express';
import type { Role } from '../constants/index.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/index.js';
import type { AuthRequest } from '../types/index.js';

/**
 * Restricts access to the given roles. Must run after `authenticate`.
 */
export const authorize =
  (...allowedRoles: Role[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      next(ApiError.forbidden(MESSAGES.FORBIDDEN));
      return;
    }

    next();
  };

export default authorize;
