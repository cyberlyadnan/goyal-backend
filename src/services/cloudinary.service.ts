import fs from 'node:fs/promises';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { cloudinaryConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

let initialized = false;

export const initCloudinary = (): void => {
  if (initialized) return;

  if (
    !cloudinaryConfig.cloudName ||
    !cloudinaryConfig.apiKey ||
    !cloudinaryConfig.apiSecret
  ) {
    logger.warn(
      'Cloudinary credentials missing — image uploads will be unavailable',
    );
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

const assertReady = (): void => {
  if (!initialized) {
    initCloudinary();
  }
  if (!initialized) {
    throw ApiError.internal(
      'Image upload is unavailable. Configure Cloudinary credentials.',
    );
  }
};

export type CatalogFolder = 'brands' | 'categories' | 'products';

export interface UploadImageResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Uploads a local file path (e.g. from Multer) to Cloudinary, then deletes the
 * temp file. Falls back to returning a file:// style path only in tests is not
 * supported — credentials are required in all environments that upload.
 */
export const uploadImage = async (
  filePath: string,
  folder: CatalogFolder,
): Promise<UploadImageResult> => {
  assertReady();

  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(
      filePath,
      {
        folder: `${cloudinaryConfig.folder}/${folder}`,
        resource_type: 'image',
        overwrite: false,
      },
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      ...(result.width ? { width: result.width } : {}),
      ...(result.height ? { height: result.height } : {}),
      ...(result.format ? { format: result.format } : {}),
    };
  } finally {
    await fs.unlink(filePath).catch(() => undefined);
  }
};

export const uploadImages = async (
  filePaths: string[],
  folder: CatalogFolder,
): Promise<UploadImageResult[]> => {
  const uploads: UploadImageResult[] = [];
  for (const filePath of filePaths) {
    uploads.push(await uploadImage(filePath, folder));
  }
  return uploads;
};

/**
 * Accepts a remote URL or data URI and stores it under the catalog folder.
 */
export const uploadImageFromUrl = async (
  imageUrl: string,
  folder: CatalogFolder,
): Promise<UploadImageResult> => {
  assertReady();

  const result: UploadApiResponse = await cloudinary.uploader.upload(imageUrl, {
    folder: `${cloudinaryConfig.folder}/${folder}`,
    resource_type: 'image',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    ...(result.width ? { width: result.width } : {}),
    ...(result.height ? { height: result.height } : {}),
    ...(result.format ? { format: result.format } : {}),
  };
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!publicId) return;
  assertReady();
  await cloudinary.uploader.destroy(publicId);
};

export { cloudinary };
