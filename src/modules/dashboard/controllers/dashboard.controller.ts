import type { Request, Response } from 'express';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import { MESSAGES } from '../../../constants/index.js';
import { dashboardService } from '../services/dashboard.service.js';

/**
 * Dashboard controllers — thin HTTP adapters. Business logic lives in services.
 */
export class DashboardController {
  constructor(private readonly service = dashboardService) {}

  health = async (_req: Request, res: Response): Promise<Response> => {
    const data = await this.service.getModuleStatus();
    return ApiResponse.ok(res, MESSAGES.SUCCESS, data);
  };

  notImplemented = async (_req: Request, _res: Response): Promise<never> => {
    throw ApiError.notImplemented();
  };
}

export const dashboardController = new DashboardController();
