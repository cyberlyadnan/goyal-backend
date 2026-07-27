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
import type { IBrandDocument } from '../models/brand.model.js';
import { brandsRepository } from '../repositories/brands.repository.js';
import type {
  CreateBrandInput,
  ListBrandsQuery,
  UpdateBrandInput,
} from '../validators/brands.validator.js';

export interface PublicBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  bannerImage?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class BrandsService {
  constructor(private readonly repository = brandsRepository) {}

  async create(input: CreateBrandInput): Promise<PublicBrand> {
    const slug = await this.resolveSlug(input.name, input.slug);
    const brand = await this.repository.create({
      name: input.name,
      slug,
      ...(input.logo ? { logo: input.logo } : {}),
      ...(input.bannerImage ? { bannerImage: input.bannerImage } : {}),
      ...(input.description ? { description: input.description } : {}),
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    });
    return this.toPublic(brand);
  }

  async update(id: string, input: UpdateBrandInput): Promise<PublicBrand> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw ApiError.notFound(MESSAGES.BRAND_NOT_FOUND);
    }

    const payload: Partial<IBrandDocument> = { ...input };
    if (input.name || input.slug) {
      payload.slug = await this.resolveSlug(
        input.name ?? existing.name,
        input.slug,
        id,
      );
    }

    // Empty strings clear optional image fields.
    if (input.logo === '') payload.logo = undefined;
    if (input.bannerImage === '') payload.bannerImage = undefined;

    const updated = await this.repository.updateById(id, payload);
    if (!updated) {
      throw ApiError.notFound(MESSAGES.BRAND_NOT_FOUND);
    }
    return this.toPublic(updated);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw ApiError.notFound(MESSAGES.BRAND_NOT_FOUND);
    }
    await this.repository.softDelete(id);
  }

  async getById(id: string, activeOnly = false): Promise<PublicBrand> {
    const brand = await this.repository.findById(id);
    if (!brand || (activeOnly && !brand.isActive)) {
      throw ApiError.notFound(MESSAGES.BRAND_NOT_FOUND);
    }
    return this.toPublic(brand);
  }

  async list(
    query: ListBrandsQuery,
    options: { activeOnly?: boolean } = {},
  ): Promise<{ items: PublicBrand[]; meta: PaginationMeta }> {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(query.search, ['name', 'description']),
    };

    if (options.activeOnly) {
      filter.isActive = true;
    } else if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const sort = buildSort({
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      allowedFields: ['name', 'displayOrder', 'createdAt'],
      defaultSort: { displayOrder: 1, name: 1 },
    });

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

  private toPublic(brand: IBrandDocument): PublicBrand {
    return {
      id: brand._id.toString(),
      name: brand.name,
      slug: brand.slug,
      ...(brand.logo ? { logo: brand.logo } : {}),
      ...(brand.bannerImage ? { bannerImage: brand.bannerImage } : {}),
      ...(brand.description ? { description: brand.description } : {}),
      displayOrder: brand.displayOrder,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }
}

export const brandsService = new BrandsService();
