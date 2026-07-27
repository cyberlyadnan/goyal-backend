import { Category, type ICategoryDocument } from '../models/category.model.js';

export interface CategoryListQuery {
  filter: Record<string, unknown>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
}

export class CategoriesRepository {
  create(payload: Partial<ICategoryDocument>): Promise<ICategoryDocument> {
    return Category.create(payload);
  }

  findById(id: string): Promise<ICategoryDocument | null> {
    return Category.findById(id).exec();
  }

  findBySlug(slug: string): Promise<ICategoryDocument | null> {
    return Category.findOne({ slug }).exec();
  }

  async updateById(
    id: string,
    payload: Partial<ICategoryDocument>,
  ): Promise<ICategoryDocument | null> {
    return Category.findByIdAndUpdate(id, { $set: payload }, {
      returnDocument: 'after',
      runValidators: true,
    }).exec();
  }

  async softDelete(id: string): Promise<ICategoryDocument | null> {
    return Category.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { returnDocument: 'after' },
    ).exec();
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await Category.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async list(
    query: CategoryListQuery,
  ): Promise<{ items: ICategoryDocument[]; total: number }> {
    const [items, total] = await Promise.all([
      Category.find(query.filter)
        .sort(query.sort)
        .skip(query.skip)
        .limit(query.limit)
        .exec(),
      Category.countDocuments(query.filter).exec(),
    ]);
    return { items, total };
  }
}

export const categoriesRepository = new CategoriesRepository();
