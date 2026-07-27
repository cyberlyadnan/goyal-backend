import type { Response } from 'express';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { MESSAGES } from '../../../constants/index.js';
import type { AuthRequest } from '../../../types/index.js';
import { authService } from '../services/auth.service.js';
import type {
  RefreshTokenInput,
  SendOtpInput,
  VerifyOtpInput,
} from '../validators/auth.validator.js';

/**
 * Auth controllers — thin HTTP adapters. Business logic lives in services.
 */
export class AuthController {
  constructor(private readonly service = authService) {}

  sendOtp = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as SendOtpInput;
    const data = await this.service.sendOtp(body);
    return ApiResponse.ok(res, MESSAGES.OTP_SENT, data);
  };

  verifyOtp = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as VerifyOtpInput;
    const data = await this.service.verifyOtp(body);
    return ApiResponse.ok(res, MESSAGES.LOGIN_SUCCESS, data);
  };

  refresh = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as RefreshTokenInput;
    const data = await this.service.refresh(body);
    return ApiResponse.ok(res, MESSAGES.TOKEN_REFRESHED, data);
  };

  logout = async (req: AuthRequest, res: Response): Promise<Response> => {
    if (!req.user?.id) {
      return ApiResponse.ok(res, MESSAGES.LOGOUT_SUCCESS, {});
    }
    await this.service.logout(req.user.id);
    return ApiResponse.ok(res, MESSAGES.LOGOUT_SUCCESS, {});
  };

  me = async (req: AuthRequest, res: Response): Promise<Response> => {
    const user = await this.service.getMe(req.user!.id);
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { user });
  };
}

export const authController = new AuthController();
