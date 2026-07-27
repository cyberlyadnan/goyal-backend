import { Types } from 'mongoose';
import {
  buildPaginationMeta,
  buildSearchFilter,
  buildSort,
  getPagination,
  slugify,
} from '../../../helpers/index.js';
import { ApiError } from '../../../utils/ApiError.js';
import { MESSAGES } from '../../../constants/index.js';
import type { PaginationMeta } from '../../../types/index.js';
import { brandsRepository } from '../../brands/repositories/brands.repository.js';
import { categoriesRepository } from '../../categories/repositories/categories.repository.js';
import type { IProductDocument, ProductUnit } from '../models/product.model.js';
import {
  productsRepository,
  type ProductWithRelations,
} from '../repositories/products.repository.js';
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
  UpdateStockInput,
} from '../validators/products.validator.js';

export interface PublicProductBrand {
  id: string;
  name: string;
  logo?: string;
  slug?: string;
}

export interface PublicProductCategory {
  id: string;
  name: string;
  image?: string;
  slug?: string;
}

export interface PublicProduct {
  id: string;
  productName: string;
  slug: string;
  brandId: string;
  categoryId: string;
  brand?: PublicProductBrand;
  category?: PublicProductCategory;
  description?: string;
  sku: string;
  barcode?: string;
  weight?: number;
  unit: ProductUnit;
  mrp: number;
  sellingPrice: number;
  offerPrice?: number;
  effectivePrice: number;
  gst: number;
  stock: number;
  minimumOrderQuantity: number;
  maximumOrderQuantity?: number;
  images: string[];
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isAvailable: boolean;
  isActive: boolean;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductsService {
  constructor(
    private readonly repository = productsRepository,
    private readonly brands = brandsRepository,
    private readonly categories = categoriesRepository,
  ) {}

  async create(input: CreateProductInput): Promise<PublicProduct> {
    await this.assertRelations(input.brandId, input.categoryId);

    const sku = input.sku.toUpperCase();
    const existingSku = await this.repository.findBySku(sku);
    if (existingSku) {
      throw ApiError.conflict('A product with this SKU already exists');
    }

    const slug = await this.resolveSlug(input.productName, input.slug);
    const product = await this.repository.create({
      productName: input.productName,
      slug,
      brandId: new Types.ObjectId(input.brandId),
      categoryId: new Types.ObjectId(input.categoryId),
      ...(input.description ? { description: input.description } : {}),
      sku,
      ...(input.barcode ? { barcode: input.barcode } : {}),
      ...(input.weight !== undefined ? { weight: input.weight } : {}),
      unit: input.unit ?? 'pcs',
      mrp: input.mrp,
      sellingPrice: input.sellingPrice,
      ...(input.offerPrice !== undefined ? { offerPrice: input.offerPrice } : {}),
      gst: input.gst ?? 0,
      stock: input.stock ?? 0,
      minimumOrderQuantity: input.minimumOrderQuantity ?? 1,
      ...(input.maximumOrderQuantity !== undefined
        ? { maximumOrderQuantity: input.maximumOrderQuantity }
        : {}),
      images: input.images ?? [],
      tags: input.tags ?? [],
      isFeatured: input.isFeatured ?? false,
      isBestSeller: input.isBestSeller ?? false,
      isAvailable: input.isAvailable ?? true,
      isActive: input.isActive ?? true,
    });

    const populated = await this.repository.findByIdPopulated(
      product._id.toString(),
    );
    return this.toPublic(populated ?? product);
  }

  async update(id: string, input: UpdateProductInput): Promise<PublicProduct> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw ApiError.notFound(MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (input.brandId || input.categoryId) {
      await this.assertRelations(
        input.brandId ?? existing.brandId.toString(),
        input.categoryId ?? existing.categoryId.toString(),
      );
    }

    if (input.sku) {
      const sku = input.sku.toUpperCase();
      const clash = await this.repository.findBySku(sku);
      if (clash && clash._id.toString() !== id) {
        throw ApiError.conflict('A product with this SKU already exists');
      }
      input.sku = sku;
    }

    const payload: Record<string, unknown> = { ...input };
    if (input.productName || input.slug) {
      payload.slug = await this.resolveSlug(
        input.productName ?? existing.productName,
        input.slug,
        id,
      );
    }
    if (input.brandId) {
      payload.brandId = new Types.ObjectId(input.brandId);
    }
    if (input.categoryId) {
      payload.categoryId = new Types.ObjectId(input.categoryId);
    }

    const updated = await this.repository.updateById(id, payload);
    if (!updated) {
      throw ApiError.notFound(MESSAGES.PRODUCT_NOT_FOUND);
    }

    const populated = await this.repository.findByIdPopulated(id);
    return this.toPublic(populated ?? updated);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw ApiError.notFound(MESSAGES.PRODUCT_NOT_FOUND);
    }
    await this.repository.softDelete(id);
  }

  async getById(id: string, activeOnly = false): Promise<PublicProduct> {
    const product = await this.repository.findByIdPopulated(id);
    if (
      !product ||
      (activeOnly && (!product.isActive || !product.isAvailable))
    ) {
      throw ApiError.notFound(MESSAGES.PRODUCT_NOT_FOUND);
    }
    return this.toPublic(product);
  }

  async updateStock(id: string, input: UpdateStockInput): Promise<PublicProduct> {
    const updated = await this.repository.updateById(id, {
      stock: input.stock,
      isAvailable: input.stock > 0,
    });
    if (!updated) {
      throw ApiError.notFound(MESSAGES.PRODUCT_NOT_FOUND);
    }
    const populated = await this.repository.findByIdPopulated(id);
    return this.toPublic(populated ?? updated);
  }

  async toggleFlag(
    id: string,
    field: 'isFeatured' | 'isBestSeller' | 'isAvailable',
    value?: boolean,
  ): Promise<PublicProduct> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw ApiError.notFound(MESSAGES.PRODUCT_NOT_FOUND);
    }

    const next = value ?? !existing[field];
    const updated = await this.repository.updateById(id, { [field]: next });
    if (!updated) {
      throw ApiError.notFound(MESSAGES.PRODUCT_NOT_FOUND);
    }
    const populated = await this.repository.findByIdPopulated(id);
    return this.toPublic(populated ?? updated);
  }

  async list(
    query: ListProductsQuery,
    options: { activeOnly?: boolean } = {},
  ): Promise<{ items: PublicProduct[]; meta: PaginationMeta }> {
    const { page, limit, skip } = getPagination(query);
    const filter = this.buildProductFilter(query, options.activeOnly === true);
    const sort = this.resolveSort(query);

    const { items, total } = await this.repository.list({
      filter,
      sort,
      skip,
      limit,
    });

    return {
      items: items.map((item) => this.toPublic(item)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async listByBrand(
    brandId: string,
    query: ListProductsQuery,
  ): Promise<{ items: PublicProduct[]; meta: PaginationMeta }> {
    const brand = await this.brands.findById(brandId);
    if (!brand || !brand.isActive) {
      throw ApiError.notFound(MESSAGES.BRAND_NOT_FOUND);
    }
    return this.list({ ...query, brandId }, { activeOnly: true });
  }

  async listByCategory(
    categoryId: string,
    query: ListProductsQuery,
  ): Promise<{ items: PublicProduct[]; meta: PaginationMeta }> {
    const category = await this.categories.findById(categoryId);
    if (!category || !category.isActive) {
      throw ApiError.notFound(MESSAGES.CATEGORY_NOT_FOUND);
    }
    return this.list({ ...query, categoryId }, { activeOnly: true });
  }

  async listFeatured(
    query: ListProductsQuery,
  ): Promise<{ items: PublicProduct[]; meta: PaginationMeta }> {
    return this.list({ ...query, isFeatured: true }, { activeOnly: true });
  }

  async listBestSellers(
    query: ListProductsQuery,
  ): Promise<{ items: PublicProduct[]; meta: PaginationMeta }> {
    return this.list({ ...query, isBestSeller: true }, { activeOnly: true });
  }

  private buildProductFilter(
    query: ListProductsQuery,
    activeOnly: boolean,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(query.search, ['productName', 'sku', 'barcode', 'tags']),
    };

    if (query.brandId) filter.brandId = query.brandId;
    if (query.categoryId) filter.categoryId = query.categoryId;

    if (activeOnly) {
      filter.isActive = true;
      filter.isAvailable = true;
    } else {
      if (query.isActive !== undefined) filter.isActive = query.isActive;
      if (query.isAvailable !== undefined) filter.isAvailable = query.isAvailable;
    }

    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;
    if (query.isBestSeller !== undefined) filter.isBestSeller = query.isBestSeller;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.sellingPrice = {
        ...(query.minPrice !== undefined ? { $gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}),
      };
    }

    return filter;
  }

  private resolveSort(query: ListProductsQuery): Record<string, 1 | -1> {
    if (query.sort === 'newest') return { createdAt: -1 };
    if (query.sort === 'price_low') return { sellingPrice: 1 };
    if (query.sort === 'price_high') return { sellingPrice: -1 };
    if (query.sort === 'alphabetical') return { productName: 1 };

    return buildSort({
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      allowedFields: ['productName', 'sellingPrice', 'createdAt', 'stock'],
      defaultSort: { createdAt: -1 },
    });
  }

  private async assertRelations(
    brandId: string,
    categoryId: string,
  ): Promise<void> {
    const [brand, category] = await Promise.all([
      this.brands.findById(brandId),
      this.categories.findById(categoryId),
    ]);
    if (!brand || !brand.isActive) {
      throw ApiError.badRequest(MESSAGES.BRAND_NOT_FOUND);
    }
    if (!category || !category.isActive) {
      throw ApiError.badRequest(MESSAGES.CATEGORY_NOT_FOUND);
    }
  }

  private async resolveSlug(
    name: string,
    requested?: string,
    excludeId?: string,
  ): Promise<string> {
    const base = slugify(requested || name);
    if (!base) {
      throw ApiError.badRequest('Unable to generate a valid slug');
    }

    let candidate = base;
    let counter = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.repository.findBySlug(candidate);
      if (!existing || (excludeId && existing._id.toString() === excludeId)) {
        return candidate;
      }
      candidate = `${base}-${counter}`;
      counter += 1;
    }
  }

  private toPublic(
    product: IProductDocument | ProductWithRelations,
  ): PublicProduct {
    const brandRef = product.brandId as ProductWithRelations['brandId'];
    const categoryRef = product.categoryId as ProductWithRelations['categoryId'];

    const brand =
      brandRef && typeof brandRef === 'object' && 'name' in brandRef
        ? {
            id: brandRef._id.toString(),
            name: brandRef.name,
            ...(brandRef.logo ? { logo: brandRef.logo } : {}),
            ...(brandRef.slug ? { slug: brandRef.slug } : {}),
          }
        : undefined;

    const category =
      categoryRef && typeof categoryRef === 'object' && 'name' in categoryRef
        ? {
            id: categoryRef._id.toString(),
            name: categoryRef.name,
            ...(categoryRef.image ? { image: categoryRef.image } : {}),
            ...(categoryRef.slug ? { slug: categoryRef.slug } : {}),
          }
        : undefined;

    const brandId =
      brand?.id ??
      (typeof brandRef === 'object' && '_id' in brandRef
        ? brandRef._id.toString()
        : String(product.brandId));

    const categoryId =
      category?.id ??
      (typeof categoryRef === 'object' && '_id' in categoryRef
        ? categoryRef._id.toString()
        : String(product.categoryId));

    const effectivePrice =
      product.offerPrice !== undefined && product.offerPrice > 0
        ? product.offerPrice
        : product.sellingPrice;

    return {
      id: product._id.toString(),
      productName: product.productName,
      slug: product.slug,
      brandId,
      categoryId,
      ...(brand ? { brand } : {}),
      ...(category ? { category } : {}),
      ...(product.description ? { description: product.description } : {}),
      sku: product.sku,
      ...(product.barcode ? { barcode: product.barcode } : {}),
      ...(product.weight !== undefined ? { weight: product.weight } : {}),
      unit: product.unit,
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      ...(product.offerPrice !== undefined
        ? { offerPrice: product.offerPrice }
        : {}),
      effectivePrice,
      gst: product.gst,
      stock: product.stock,
      minimumOrderQuantity: product.minimumOrderQuantity,
      ...(product.maximumOrderQuantity !== undefined
        ? { maximumOrderQuantity: product.maximumOrderQuantity }
        : {}),
      images: product.images ?? [],
      tags: product.tags ?? [],
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      isAvailable: product.isAvailable,
      isActive: product.isActive,
      inStock: product.stock > 0 && product.isAvailable,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

export const productsService = new ProductsService();
