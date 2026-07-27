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
import type { ICategoryDocument } from '../models/category.model.js';
import { categoriesRepository } from '../repositories/categories.repository.js';
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from '../validators/categories.validator.js';

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoriesService {
  constructor(private readonly repository = categoriesRepository) {}

  async create(input: CreateCategoryInput): Promise<PublicCategory> {
    const slug = await this.resolveSlug(input.name, input.slug);
    const category = await this.repository.create({
      name: input.name,
      slug,
      ...(input.image ? { image: input.image } : {}),
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    });
    return this.toPublic(category);
  }

  async update(
    id: string,
    input: UpdateCategoryInput,
  ): Promise<PublicCategory> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw ApiError.notFound(MESSAGES.CATEGORY_NOT_FOUND);
    }

    const payload: Partial<ICategoryDocument> = { ...input };
    if (input.name || input.slug) {
      payload.slug = await this.resolveSlug(
        input.name ?? existing.name,
        input.slug,
        id,
      );
    }
    if (input.image === '') payload.image = undefined;

    const updated = await this.repository.updateById(id, payload);
    if (!updated) {
      throw ApiError.notFound(MESSAGES.CATEGORY_NOT_FOUND);
    }
    return this.toPublic(updated);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw ApiError.notFound(MESSAGES.CATEGORY_NOT_FOUND);
    }
    await this.repository.softDelete(id);
  }

  async getById(id: string, activeOnly = false): Promise<PublicCategory> {
    const category = await this.repository.findById(id);
    if (!category || (activeOnly && !category.isActive)) {
      throw ApiError.notFound(MESSAGES.CATEGORY_NOT_FOUND);
    }
    return this.toPublic(category);
  }

  async list(
    query: ListCategoriesQuery,
    options: { activeOnly?: boolean } = {},
  ): Promise<{ items: PublicCategory[]; meta: PaginationMeta }> {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(query.search, ['name']),
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

  private toPublic(category: ICategoryDocument): PublicCategory {
    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      ...(category.image ? { image: category.image } : {}),
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}

export const categoriesService = new CategoriesService();
