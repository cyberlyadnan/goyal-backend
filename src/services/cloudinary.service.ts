import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';

let initialized = false;

export const initCloudinary = (): void => {
  if (initialized) return;

  if (!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey || !cloudinaryConfig.apiSecret) {
    logger.warn('Cloudinary credentials missing — image uploads will be unavailable');
    return;
  }

  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
    secure: true,
  });

  initialized = true;
  logger.info('Cloudinary configured');
};

export { cloudinary };
