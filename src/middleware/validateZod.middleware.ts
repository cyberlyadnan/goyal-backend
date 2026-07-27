import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/index.js';

type RequestTarget = 'body' | 'query' | 'params';

/**
 * Zod-based request validator. Parses the chosen request slice, replaces it
 * with the typed output, and returns a structured 422 on failure.
 */
export const validateZod =
  <T>(schema: ZodType<T>, target: RequestTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || target,
        message: issue.message,
      }));
      next(ApiError.unprocessable(MESSAGES.VALIDATION_FAILED, errors));
      return;
    }

    req[target] = result.data as Request[typeof target];
    next();
  };

export default validateZod;
