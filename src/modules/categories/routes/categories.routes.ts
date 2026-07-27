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
import { categoriesController } from '../controllers/categories.controller.js';
import { productsController } from '../../products/controllers/products.controller.js';
import {
  categoryIdAliasParamsSchema,
  categoryIdParamsSchema,
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from '../validators/categories.validator.js';
import { listProductsQuerySchema } from '../../products/validators/products.validator.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get(
  '/',
  authenticate,
  validateZod(listCategoriesQuerySchema, 'query'),
  catchAsync(categoriesController.listActive),
);

router.post(
  '/',
  ...adminOnly,
  validateZod(createCategorySchema),
  catchAsync(categoriesController.create),
);

router.post(
  '/upload-image',
  ...adminOnly,
  upload.single('image'),
  catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.file?.path) {
      throw ApiError.badRequest('Image file is required');
    }
    const image = await uploadImage(req.file.path, 'categories');
    return ApiResponse.ok(res, 'Image uploaded successfully', { image });
  }),
);

router.get(
  '/:categoryId/products',
  authenticate,
  validateZod(categoryIdAliasParamsSchema, 'params'),
  validateZod(listProductsQuerySchema, 'query'),
  catchAsync(productsController.listByCategory),
);

router.get(
  '/:id',
  authenticate,
  validateZod(categoryIdParamsSchema, 'params'),
  catchAsync(categoriesController.getById),
);

router.patch(
  '/:id',
  ...adminOnly,
  validateZod(categoryIdParamsSchema, 'params'),
  validateZod(updateCategorySchema),
  catchAsync(categoriesController.update),
);

router.delete(
  '/:id',
  ...adminOnly,
  validateZod(categoryIdParamsSchema, 'params'),
  catchAsync(categoriesController.remove),
);

export default router;
