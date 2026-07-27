import type { Response } from 'express';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { MESSAGES } from '../../../constants/index.js';
import type { AuthRequest } from '../../../types/index.js';
import { categoriesService } from '../services/categories.service.js';
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from '../validators/categories.validator.js';

export class CategoriesController {
  constructor(private readonly service = categoriesService) {}

  create = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as CreateCategoryInput;
    const data = await this.service.create(body);
    return ApiResponse.created(res, MESSAGES.CATEGORY_CREATED, {
      category: data,
    });
  };

  update = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as UpdateCategoryInput;
    const data = await this.service.update(req.params.id, body);
    return ApiResponse.ok(res, MESSAGES.CATEGORY_UPDATED, { category: data });
  };

  remove = async (req: AuthRequest, res: Response): Promise<Response> => {
    await this.service.remove(req.params.id);
    return ApiResponse.ok(res, MESSAGES.CATEGORY_DELETED, {});
  };

  getById = async (req: AuthRequest, res: Response): Promise<Response> => {
    const activeOnly = req.user?.role === 'retailer';
    const data = await this.service.getById(req.params.id, activeOnly);
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { category: data });
  };

  list = async (req: AuthRequest, res: Response): Promise<Response> => {
    const query = req.query as unknown as ListCategoriesQuery;
    const activeOnly =
      req.user?.role !== 'admin' && req.user?.role !== 'super_admin';
    const { items, meta } = await this.service.list(query, { activeOnly });
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { categories: items }, { ...meta });
  };

  listActive = async (req: AuthRequest, res: Response): Promise<Response> => {
    const query = req.query as unknown as ListCategoriesQuery;
    const { items, meta } = await this.service.list(query, {
      activeOnly: true,
    });
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { categories: items }, { ...meta });
  };
}

export const categoriesController = new CategoriesController();
