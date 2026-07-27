import { generateOtp } from '../../../helpers/otp.helper.js';
import { hashPassword, comparePassword } from '../../../helpers/password.helper.js';
import { logger } from '../../../utils/logger.js';
import { ApiError } from '../../../utils/ApiError.js';
import { MESSAGES } from '../../../constants/index.js';
import { authRepository } from '../repositories/auth.repository.js';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

/**
 * OTP lifecycle. SMS provider integration is intentionally deferred —
 * plaintext OTP is logged for development only.
 */
export class OtpService {
  constructor(private readonly repository = authRepository) {}

  async createAndDispatch(mobile: string): Promise<{ expiresInSeconds: number }> {
    const otp = generateOtp(6);
    const otpHash = await hashPassword(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await this.repository.upsertOtp({
      mobile,
      otpHash,
      expiresAt,
    });

    // TODO: replace with SMS provider (MSG91 / Twilio / etc.)
    logger.info(`[OTP] mobile=${mobile} otp=${otp} expiresAt=${expiresAt.toISOString()}`);
    // Also print to console for local debugging when Winston file-only is used.
    // eslint-disable-next-line no-console
    console.log(`\n========== OTP for ${mobile}: ${otp} (expires in 5 min) ==========\n`);

    return { expiresInSeconds: OTP_EXPIRY_MS / 1000 };
  }

  async verify(mobile: string, otp: string): Promise<void> {
    const record = await this.repository.findOtpByMobile(mobile);

    if (!record) {
      throw ApiError.badRequest(MESSAGES.OTP_INVALID);
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await this.repository.deleteOtp(mobile);
      throw ApiError.badRequest(MESSAGES.OTP_EXPIRED);
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await this.repository.deleteOtp(mobile);
      throw ApiError.tooManyRequests(MESSAGES.OTP_MAX_ATTEMPTS);
    }

    const matches = await comparePassword(otp, record.otp);
    if (!matches) {
      const updated = await this.repository.incrementOtpAttempts(mobile);
      if (updated && updated.attempts >= MAX_OTP_ATTEMPTS) {
        await this.repository.deleteOtp(mobile);
        throw ApiError.tooManyRequests(MESSAGES.OTP_MAX_ATTEMPTS);
      }
      throw ApiError.badRequest(MESSAGES.OTP_INVALID);
    }

    await this.repository.deleteOtp(mobile);
  }
}

export const otpService = new OtpService();
