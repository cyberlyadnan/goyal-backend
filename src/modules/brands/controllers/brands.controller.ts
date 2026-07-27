import type { Response } from 'express';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { MESSAGES } from '../../../constants/index.js';
import type { AuthRequest } from '../../../types/index.js';
import { brandsService } from '../services/brands.service.js';
import type {
  CreateBrandInput,
  ListBrandsQuery,
  UpdateBrandInput,
} from '../validators/brands.validator.js';

export class BrandsController {
  constructor(private readonly service = brandsService) {}

  create = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as CreateBrandInput;
    const data = await this.service.create(body);
    return ApiResponse.created(res, MESSAGES.BRAND_CREATED, { brand: data });
  };

  update = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as UpdateBrandInput;
    const data = await this.service.update(req.params.id, body);
    return ApiResponse.ok(res, MESSAGES.BRAND_UPDATED, { brand: data });
  };

  remove = async (req: AuthRequest, res: Response): Promise<Response> => {
    await this.service.remove(req.params.id);
    return ApiResponse.ok(res, MESSAGES.BRAND_DELETED, {});
  };

  getById = async (req: AuthRequest, res: Response): Promise<Response> => {
    const activeOnly = req.user?.role === 'retailer';
    const data = await this.service.getById(req.params.id, activeOnly);
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { brand: data });
  };

  list = async (req: AuthRequest, res: Response): Promise<Response> => {
    const query = req.query as unknown as ListBrandsQuery;
    const activeOnly = req.user?.role !== 'admin' && req.user?.role !== 'super_admin';
    const { items, meta } = await this.service.list(query, { activeOnly });
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { brands: items }, { ...meta });
  };

  /** Retailer-facing active brands list. */
  listActive = async (req: AuthRequest, res: Response): Promise<Response> => {
    const query = req.query as unknown as ListBrandsQuery;
    const { items, meta } = await this.service.list(query, { activeOnly: true });
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { brands: items }, { ...meta });
  };
}

export const brandsController = new BrandsController();
