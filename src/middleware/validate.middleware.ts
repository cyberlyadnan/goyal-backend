import type { NextFunction, Request, Response } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/index.js';

/**
 * Runs express-validator chains and returns a structured 422 on failure.
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) {
      next();
      return;
    }

    const errors = result.array().map((err) => {
      if (err.type === 'field') {
        return { field: err.path, message: err.msg, value: err.value };
      }
      return { message: err.msg };
    });

    next(ApiError.unprocessable(MESSAGES.VALIDATION_FAILED, errors));
  };
};

export default validate;
