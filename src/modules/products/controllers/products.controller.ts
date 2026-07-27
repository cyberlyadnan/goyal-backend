import type { Response } from 'express';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { MESSAGES } from '../../../constants/index.js';
import type { AuthRequest } from '../../../types/index.js';
import { productsService } from '../services/products.service.js';
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
  UpdateStockInput,
} from '../validators/products.validator.js';

export class ProductsController {
  constructor(private readonly service = productsService) {}

  create = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as CreateProductInput;
    const data = await this.service.create(body);
    return ApiResponse.created(res, MESSAGES.PRODUCT_CREATED, {
      product: data,
    });
  };

  update = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as UpdateProductInput;
    const data = await this.service.update(req.params.id, body);
    return ApiResponse.ok(res, MESSAGES.PRODUCT_UPDATED, { product: data });
  };

  remove = async (req: AuthRequest, res: Response): Promise<Response> => {
    await this.service.remove(req.params.id);
    return ApiResponse.ok(res, MESSAGES.PRODUCT_DELETED, {});
  };

  getById = async (req: AuthRequest, res: Response): Promise<Response> => {
    const activeOnly =
      req.user?.role !== 'admin' && req.user?.role !== 'super_admin';
    const data = await this.service.getById(req.params.id, activeOnly);
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { product: data });
  };

  list = async (req: AuthRequest, res: Response): Promise<Response> => {
    const query = req.query as unknown as ListProductsQuery;
    const activeOnly =
      req.user?.role !== 'admin' && req.user?.role !== 'super_admin';
    const { items, meta } = await this.service.list(query, { activeOnly });
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { products: items }, { ...meta });
  };

  listByBrand = async (req: AuthRequest, res: Response): Promise<Response> => {
    const query = req.query as unknown as ListProductsQuery;
    const brandId = req.params.brandId;
    const { items, meta } = await this.service.listByBrand(brandId, query);
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { products: items }, { ...meta });
  };

  listByCategory = async (
    req: AuthRequest,
    res: Response,
  ): Promise<Response> => {
    const query = req.query as unknown as ListProductsQuery;
    const categoryId = req.params.categoryId;
    const { items, meta } = await this.service.listByCategory(
      categoryId,
      query,
    );
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { products: items }, { ...meta });
  };

  listFeatured = async (
    req: AuthRequest,
    res: Response,
  ): Promise<Response> => {
    const query = req.query as unknown as ListProductsQuery;
    const { items, meta } = await this.service.listFeatured(query);
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { products: items }, { ...meta });
  };

  listBestSellers = async (
    req: AuthRequest,
    res: Response,
  ): Promise<Response> => {
    const query = req.query as unknown as ListProductsQuery;
    const { items, meta } = await this.service.listBestSellers(query);
    return ApiResponse.ok(res, MESSAGES.SUCCESS, { products: items }, { ...meta });
  };

  updateStock = async (req: AuthRequest, res: Response): Promise<Response> => {
    const body = req.body as UpdateStockInput;
    const data = await this.service.updateStock(req.params.id, body);
    return ApiResponse.ok(res, MESSAGES.STOCK_UPDATED, { product: data });
  };

  toggleFeatured = async (
    req: AuthRequest,
    res: Response,
  ): Promise<Response> => {
    const value =
      typeof req.body?.value === 'boolean' ? req.body.value : undefined;
    const data = await this.service.toggleFlag(
      req.params.id,
      'isFeatured',
      value,
    );
    return ApiResponse.ok(res, MESSAGES.PRODUCT_UPDATED, { product: data });
  };

  toggleBestSeller = async (
    req: AuthRequest,
    res: Response,
  ): Promise<Response> => {
    const value =
      typeof req.body?.value === 'boolean' ? req.body.value : undefined;
    const data = await this.service.toggleFlag(
      req.params.id,
      'isBestSeller',
      value,
    );
    return ApiResponse.ok(res, MESSAGES.PRODUCT_UPDATED, { product: data });
  };

  toggleAvailability = async (
    req: AuthRequest,
    res: Response,
  ): Promise<Response> => {
    const value =
      typeof req.body?.value === 'boolean' ? req.body.value : undefined;
    const data = await this.service.toggleFlag(
      req.params.id,
      'isAvailable',
      value,
    );
    return ApiResponse.ok(res, MESSAGES.PRODUCT_UPDATED, { product: data });
  };
}

export const productsController = new ProductsController();
