import { z } from 'zod';
import { ROLES } from '../../../constants/roles.constant.js';

const indianMobile = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10 digit Indian mobile number');

export const sendOtpSchema = z.object({
  mobile: indianMobile,
  role: z.enum([ROLES.ADMIN, ROLES.RETAILER]).optional(),
});

export const verifyOtpSchema = z.object({
  mobile: indianMobile,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'OTP must be a 6 digit code'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token is required'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
