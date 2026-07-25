import { randomInt } from 'node:crypto';

/**
 * Generates a numeric OTP of the given length (default 6).
 */
export const generateOtp = (length = 6): string => {
  if (length < 4 || length > 10) {
    throw new Error('OTP length must be between 4 and 10');
  }

  const max = 10 ** length;
  const min = 10 ** (length - 1);
  return String(randomInt(min, max));
};
