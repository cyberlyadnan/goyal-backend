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
import { uploadImage } from '../../../services/cloudinary.service.js';
import type { AuthRequest } from '../../../types/index.js';
import { brandsController } from '../controllers/brands.controller.js';
import { productsController } from '../../products/controllers/products.controller.js';
import {
  brandIdAliasParamsSchema,
  brandIdParamsSchema,
  createBrandSchema,
  listBrandsQuerySchema,
  updateBrandSchema,
} from '../validators/brands.validator.js';
import { listProductsQuerySchema } from '../../products/validators/products.validator.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get(
  '/',
  authenticate,
  validateZod(listBrandsQuerySchema, 'query'),
  catchAsync(brandsController.listActive),
);

router.post(
  '/',
  ...adminOnly,
  validateZod(createBrandSchema),
  catchAsync(brandsController.create),
);

router.post(
  '/upload-logo',
  ...adminOnly,
  upload.single('logo'),
  catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.file?.path) {
      throw ApiError.badRequest('Logo file is required');
    }
    const image = await uploadImage(req.file.path, 'brands');
    return ApiResponse.ok(res, 'Image uploaded successfully', { image });
  }),
);

router.get(
  '/:brandId/products',
  authenticate,
  validateZod(brandIdAliasParamsSchema, 'params'),
  validateZod(listProductsQuerySchema, 'query'),
  catchAsync(productsController.listByBrand),
);

router.get(
  '/:id',
  authenticate,
  validateZod(brandIdParamsSchema, 'params'),
  catchAsync(brandsController.getById),
);

router.patch(
  '/:id',
  ...adminOnly,
  validateZod(brandIdParamsSchema, 'params'),
  validateZod(updateBrandSchema),
  catchAsync(brandsController.update),
);

router.delete(
  '/:id',
  ...adminOnly,
  validateZod(brandIdParamsSchema, 'params'),
  catchAsync(brandsController.remove),
);

export default router;
