import env from './env.config.js';

export const cloudinaryConfig = {
  cloudName: env.CLOUDINARY_NAME,
  apiKey: env.CLOUDINARY_API_KEY,
  apiSecret: env.CLOUDINARY_API_SECRET,
  folder: 'goyal-wholesale',
} as const;

export default cloudinaryConfig;
