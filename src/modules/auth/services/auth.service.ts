import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../../helpers/jwt.helper.js';
import { hashPassword, comparePassword } from '../../../helpers/password.helper.js';
import { ApiError } from '../../../utils/ApiError.js';
import { MESSAGES } from '../../../constants/index.js';
import type { UserRole } from '../../../types/index.js';
import type { IUserDocument, AuthRole } from '../../users/models/user.model.js';
import { authRepository } from '../repositories/auth.repository.js';
import { otpService } from './otp.service.js';
import type {
  RefreshTokenInput,
  SendOtpInput,
  VerifyOtpInput,
} from '../validators/auth.validator.js';

export interface PublicUser {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  role: UserRole;
  shopName?: string;
  gstNumber?: string;
  address?: IUserDocument['address'];
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession extends AuthTokens {
  user: PublicUser;
}

/**
 * Auth business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class AuthService {
  constructor(
    private readonly repository = authRepository,
    private readonly otp = otpService,
  ) {}

  async sendOtp(input: SendOtpInput): Promise<{ expiresInSeconds: number }> {
    const user = await this.resolveUser(input.mobile, input.role);

    if (!user.isActive) {
      throw ApiError.forbidden(MESSAGES.USER_INACTIVE);
    }

    return this.otp.createAndDispatch(user.mobile);
  }

  async verifyOtp(input: VerifyOtpInput): Promise<AuthSession> {
    const user = await this.repository.findUserByMobile(input.mobile);

    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      throw ApiError.forbidden(MESSAGES.USER_INACTIVE);
    }

    await this.otp.verify(input.mobile, input.otp);

    return this.issueSession(user);
  }

  async refresh(input: RefreshTokenInput): Promise<AuthTokens> {
    const payload = verifyRefreshToken(input.refreshToken);
    const user = await this.repository.findUserByIdWithRefreshToken(payload.id);

    if (!user || !user.isActive) {
      throw ApiError.unauthorized(MESSAGES.TOKEN_INVALID);
    }

    if (!user.refreshToken) {
      throw ApiError.unauthorized(MESSAGES.TOKEN_INVALID);
    }

    const matches = await comparePassword(input.refreshToken, user.refreshToken);
    if (!matches) {
      throw ApiError.unauthorized(MESSAGES.TOKEN_INVALID);
    }

    const tokens = this.createTokens(user);
    const refreshTokenHash = await hashPassword(tokens.refreshToken);
    await this.repository.setRefreshToken(user._id.toString(), refreshTokenHash);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.repository.clearRefreshToken(userId);
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.repository.findUserById(userId);

    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      throw ApiError.forbidden(MESSAGES.USER_INACTIVE);
    }

    return this.toPublicUser(user);
  }

  private async resolveUser(
    mobile: string,
    role?: AuthRole,
  ): Promise<IUserDocument> {
    if (role) {
      const user = await this.repository.findUserByMobileAndRole(mobile, role);
      if (!user) {
        throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
      }
      return user;
    }

    const user = await this.repository.findUserByMobile(mobile);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  private async issueSession(user: IUserDocument): Promise<AuthSession> {
    const tokens = this.createTokens(user);
    const refreshTokenHash = await hashPassword(tokens.refreshToken);
    await this.repository.setRefreshToken(user._id.toString(), refreshTokenHash);

    const fresh = await this.repository.findUserById(user._id.toString());
    return {
      ...tokens,
      user: this.toPublicUser(fresh ?? user),
    };
  }

  private createTokens(user: IUserDocument): AuthTokens {
    const payload = {
      id: user._id.toString(),
      role: user.role as UserRole,
    };

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  private toPublicUser(user: IUserDocument): PublicUser {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      mobile: user.mobile,
      ...(user.email ? { email: user.email } : {}),
      role: user.role as UserRole,
      ...(user.shopName ? { shopName: user.shopName } : {}),
      ...(user.gstNumber ? { gstNumber: user.gstNumber } : {}),
      ...(user.address ? { address: user.address } : {}),
      ...(user.profileImage ? { profileImage: user.profileImage } : {}),
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
