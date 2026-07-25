import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse.js';
import { MESSAGES } from '../constants/index.js';

/**
 * Optional helper middleware to attach a consistent response formatter on `res`.
 * Controllers may also call `ApiResponse.ok` / `ApiResponse.created` directly.
 */
export const responseFormatter = (_req: Request, res: Response, next: NextFunction): void => {
  res.success = (
    message: string = MESSAGES.SUCCESS,
    data: unknown = {},
    meta: Record<string, unknown> = {},
  ) => ApiResponse.ok(res, message, data, meta);

  res.created = (
    message: string = MESSAGES.CREATED,
    data: unknown = {},
    meta: Record<string, unknown> = {},
  ) => ApiResponse.created(res, message, data, meta);

  next();
};

declare module 'express-serve-static-core' {
  interface Response {
    success: (
      message?: string,
      data?: unknown,
      meta?: Record<string, unknown>,
    ) => Response;
    created: (
      message?: string,
      data?: unknown,
      meta?: Record<string, unknown>,
    ) => Response;
  }
}

export default responseFormatter;
