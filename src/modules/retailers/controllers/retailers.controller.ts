import type { Request, Response } from 'express';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import { MESSAGES } from '../../../constants/index.js';
import { retailersService } from '../services/retailers.service.js';

/**
 * Retailers controllers — thin HTTP adapters. Business logic lives in services.
 */
export class RetailersController {
  constructor(private readonly service = retailersService) {}

  health = async (_req: Request, res: Response): Promise<Response> => {
    const data = await this.service.getModuleStatus();
    return ApiResponse.ok(res, MESSAGES.SUCCESS, data);
  };

  notImplemented = async (_req: Request, _res: Response): Promise<never> => {
    throw ApiError.notImplemented();
  };
}

export const retailersController = new RetailersController();
