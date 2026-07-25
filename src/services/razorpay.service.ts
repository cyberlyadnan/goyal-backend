import Razorpay from 'razorpay';
import { razorpayConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';

type RazorpayClient = InstanceType<typeof Razorpay>;

let client: RazorpayClient | null = null;

export const getRazorpayClient = (): RazorpayClient | null => {
  if (client) return client;

  if (!razorpayConfig.keyId || !razorpayConfig.keySecret) {
    logger.warn('Razorpay credentials missing — payments will be unavailable');
    return null;
  }

  client = new Razorpay({
    key_id: razorpayConfig.keyId,
    key_secret: razorpayConfig.keySecret,
  });

  logger.info('Razorpay client initialized');
  return client;
};
