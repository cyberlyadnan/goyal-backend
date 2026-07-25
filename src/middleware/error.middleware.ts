import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { appConfig } from '../config/index.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import type { ApiErrorBody } from '../types/index.js';

export const rateLimiter = rateLimit({
  windowMs: appConfig.rateLimitWindowMs,
  max: appConfig.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests(MESSAGES.TOO_MANY_REQUESTS));
  },
});

/** Prevent NoSQL operator injection in req.body / req.query / req.params */
export const sanitizeNoSql = mongoSanitize({
  replaceWith: '_',
  allowDots: true,
});

/** Basic XSS sanitization for string inputs */
export const sanitizeXss = xss();

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
};

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const error =
    err instanceof ApiError
      ? err
      : new ApiError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          MESSAGES.INTERNAL_ERROR,
          [],
          false,
          err instanceof Error ? err.stack : undefined,
        );

  if (!error.isOperational) {
    logger.error(error.message, { stack: error.stack, errors: error.errors });
  } else {
    logger.warn(error.message, { statusCode: error.statusCode, errors: error.errors });
  }

  const body: ApiErrorBody = {
    success: false,
    message: error.message,
    errors: error.errors ?? [],
  };

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(body);
};
