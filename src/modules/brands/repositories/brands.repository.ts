import { Brand, type IBrandDocument } from '../models/brand.model.js';

export interface BrandListQuery {
  filter: Record<string, unknown>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
}

export class BrandsRepository {
  create(payload: Partial<IBrandDocument>): Promise<IBrandDocument> {
    return Brand.create(payload);
  }

  findById(id: string): Promise<IBrandDocument | null> {
    return Brand.findById(id).exec();
  }

  findBySlug(slug: string): Promise<IBrandDocument | null> {
    return Brand.findOne({ slug }).exec();
  }

  async updateById(
    id: string,
    payload: Partial<IBrandDocument>,
  ): Promise<IBrandDocument | null> {
    return Brand.findByIdAndUpdate(id, { $set: payload }, {
      returnDocument: 'after',
      runValidators: true,
    }).exec();
  }

  async softDelete(id: string): Promise<IBrandDocument | null> {
    return Brand.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { returnDocument: 'after' },
    ).exec();
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await Brand.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async list(query: BrandListQuery): Promise<{ items: IBrandDocument[]; total: number }> {
    const [items, total] = await Promise.all([
      Brand.find(query.filter)
        .sort(query.sort)
        .skip(query.skip)
        .limit(query.limit)
        .exec(),
      Brand.countDocuments(query.filter).exec(),
    ]);
    return { items, total };
  }
}

export const brandsRepository = new BrandsRepository();
