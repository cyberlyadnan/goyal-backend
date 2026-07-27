import type { Response } from 'express';
import { Router } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { authorize } from '../../../middleware/role.middleware.js';
import { validateZod } from '../../../middleware/validateZod.middleware.js';
import { upload } from '../../../middleware/upload.middleware.js';
import { ROLES } from '../../../constants/roles.constant.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import { uploadImages } from '../../../services/cloudinary.service.js';
import type { AuthRequest } from '../../../types/index.js';
import { productsController } from '../controllers/products.controller.js';
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  toggleFlagSchema,
  updateProductSchema,
  updateStockSchema,
} from '../validators/products.validator.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get(
  '/',
  authenticate,
  validateZod(listProductsQuerySchema, 'query'),
  catchAsync(productsController.list),
);

router.get(
  '/featured',
  authenticate,
  validateZod(listProductsQuerySchema, 'query'),
  catchAsync(productsController.listFeatured),
);

router.get(
  '/best-sellers',
  authenticate,
  validateZod(listProductsQuerySchema, 'query'),
  catchAsync(productsController.listBestSellers),
);

router.post(
  '/',
  ...adminOnly,
  validateZod(createProductSchema),
  catchAsync(productsController.create),
);

router.post(
  '/upload-images',
  ...adminOnly,
  upload.array('images', 8),
  catchAsync(async (req: AuthRequest, res: Response) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      throw ApiError.badRequest('At least one image file is required');
    }
    const images = await uploadImages(
      files.map((file) => file.path),
      'products',
    );
    return ApiResponse.ok(res, 'Images uploaded successfully', { images });
  }),
);

router.get(
  '/:id',
  authenticate,
  validateZod(productIdParamsSchema, 'params'),
  catchAsync(productsController.getById),
);

router.patch(
  '/:id',
  ...adminOnly,
  validateZod(productIdParamsSchema, 'params'),
  validateZod(updateProductSchema),
  catchAsync(productsController.update),
);

router.delete(
  '/:id',
  ...adminOnly,
  validateZod(productIdParamsSchema, 'params'),
  catchAsync(productsController.remove),
);

router.patch(
  '/:id/stock',
  ...adminOnly,
  validateZod(productIdParamsSchema, 'params'),
  validateZod(updateStockSchema),
  catchAsync(productsController.updateStock),
);

router.patch(
  '/:id/featured',
  ...adminOnly,
  validateZod(productIdParamsSchema, 'params'),
  validateZod(toggleFlagSchema),
  catchAsync(productsController.toggleFeatured),
);

router.patch(
  '/:id/best-seller',
  ...adminOnly,
  validateZod(productIdParamsSchema, 'params'),
  validateZod(toggleFlagSchema),
  catchAsync(productsController.toggleBestSeller),
);

router.patch(
  '/:id/availability',
  ...adminOnly,
  validateZod(productIdParamsSchema, 'params'),
  validateZod(toggleFlagSchema),
  catchAsync(productsController.toggleAvailability),
);

export default router;
