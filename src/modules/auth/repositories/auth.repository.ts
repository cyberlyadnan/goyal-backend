import { User, type IUserDocument } from '../../users/models/user.model.js';
import { Otp, type IOtpDocument } from '../models/otp.model.js';
import type { AuthRole } from '../../users/models/user.model.js';

export interface CreateOtpInput {
  mobile: string;
  otpHash: string;
  expiresAt: Date;
}

/**
 * Auth data access. Controllers/services never talk to Mongoose directly.
 */
export class AuthRepository {
  findUserByMobile(mobile: string): Promise<IUserDocument | null> {
    return User.findOne({ mobile }).exec();
  }

  findUserById(id: string): Promise<IUserDocument | null> {
    return User.findById(id).exec();
  }

  findUserByIdWithRefreshToken(id: string): Promise<IUserDocument | null> {
    return User.findById(id).select('+refreshToken').exec();
  }

  findUserByMobileAndRole(
    mobile: string,
    role: AuthRole,
  ): Promise<IUserDocument | null> {
    return User.findOne({ mobile, role }).exec();
  }

  async upsertOtp(input: CreateOtpInput): Promise<IOtpDocument> {
    const doc = await Otp.findOneAndUpdate(
      { mobile: input.mobile },
      {
        $set: {
          otp: input.otpHash,
          expiresAt: input.expiresAt,
          attempts: 0,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    ).exec();

    return doc as IOtpDocument;
  }

  findOtpByMobile(mobile: string): Promise<IOtpDocument | null> {
    return Otp.findOne({ mobile }).exec();
  }

  async incrementOtpAttempts(mobile: string): Promise<IOtpDocument | null> {
    return Otp.findOneAndUpdate(
      { mobile },
      { $inc: { attempts: 1 } },
      { returnDocument: 'after' },
    ).exec();
  }

  async deleteOtp(mobile: string): Promise<void> {
    await Otp.deleteOne({ mobile }).exec();
  }

  async setRefreshToken(userId: string, refreshTokenHash: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshToken: refreshTokenHash, isVerified: true },
    }).exec();
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } }).exec();
  }

  async markVerified(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { isVerified: true } }).exec();
  }
}

export const authRepository = new AuthRepository();
