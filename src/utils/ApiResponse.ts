import type { Response } from 'express';
import { HTTP_STATUS, MESSAGES, type HttpStatusCode } from '../constants/index.js';
import type { ApiSuccessBody } from '../types/index.js';

/**
 * Standard success response envelope:
 * { success: true, message: "", data: {}, meta: {} }
 */
export class ApiResponse<T = unknown> {
  public readonly statusCode: HttpStatusCode | number;
  public readonly success = true as const;
  public readonly message: string;
  public readonly data: T;
  public readonly meta: Record<string, unknown>;

  constructor(
    statusCode: HttpStatusCode | number = HTTP_STATUS.OK,
    message: string = MESSAGES.SUCCESS,
    data: T = {} as T,
    meta: Record<string, unknown> = {},
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  send(res: Response): Response {
    const body: ApiSuccessBody<T> = {
      success: this.success,
      message: this.message,
      data: this.data,
      meta: this.meta,
    };
    return res.status(this.statusCode).json(body);
  }

  static ok<T>(
    res: Response,
    message: string = MESSAGES.SUCCESS,
    data: T = {} as T,
    meta: Record<string, unknown> = {},
  ): Response {
    return new ApiResponse(HTTP_STATUS.OK, message, data, meta).send(res);
  }

  static created<T>(
    res: Response,
    message: string = MESSAGES.CREATED,
    data: T = {} as T,
    meta: Record<string, unknown> = {},
  ): Response {
    return new ApiResponse(HTTP_STATUS.CREATED, message, data, meta).send(res);
  }

  static noContent(res: Response): Response {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}

export default ApiResponse;
