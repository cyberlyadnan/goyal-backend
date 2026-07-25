import { HTTP_STATUS, MESSAGES, type HttpStatusCode } from '../constants/index.js';

/**
 * Operational error class. Every intentional application error should be an ApiError
 * so the global error handler can format it safely.
 */
export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode | number;
  public readonly errors: unknown[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: HttpStatusCode | number,
    message: string,
    errors: unknown[] = [],
    isOperational = true,
    stack = '',
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(
    message: string = MESSAGES.VALIDATION_FAILED,
    errors: unknown[] = [],
  ): ApiError {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static unauthorized(message: string = MESSAGES.UNAUTHORIZED): ApiError {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message: string = MESSAGES.FORBIDDEN): ApiError {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message: string = MESSAGES.NOT_FOUND): ApiError {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static unprocessable(
    message: string = MESSAGES.VALIDATION_FAILED,
    errors: unknown[] = [],
  ): ApiError {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, errors);
  }

  static tooManyRequests(message: string = MESSAGES.TOO_MANY_REQUESTS): ApiError {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message);
  }

  static internal(message: string = MESSAGES.INTERNAL_ERROR): ApiError {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, [], false);
  }

  static notImplemented(message: string = MESSAGES.NOT_IMPLEMENTED): ApiError {
    return new ApiError(HTTP_STATUS.NOT_IMPLEMENTED, message);
  }
}

export default ApiError;
