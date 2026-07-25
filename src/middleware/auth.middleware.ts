import type { NextFunction, Response } from 'express';
import { verifyAccessToken } from '../helpers/jwt.helper.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/index.js';
import type { AuthRequest } from '../types/index.js';

/**
 * JWT authentication middleware. Expects `Authorization: Bearer <token>`.
 */
export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
    return;
  }

  const token = header.slice(7).trim();
  if (!token) {
    next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
