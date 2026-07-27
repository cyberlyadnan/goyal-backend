import { Types } from 'mongoose';
import { Product, type IProductDocument } from '../models/product.model.js';

export interface ProductListQuery {
  filter: Record<string, unknown>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
}

export type ProductWithRelations = IProductDocument & {
  brandId: Types.ObjectId | { _id: Types.ObjectId; name: string; logo?: string; slug?: string };
  categoryId:
    | Types.ObjectId
    | { _id: Types.ObjectId; name: string; image?: string; slug?: string };
};

export class ProductsRepository {
  create(payload: Partial<IProductDocument>): Promise<IProductDocument> {
    return Product.create(payload);
  }

  findById(id: string): Promise<IProductDocument | null> {
    return Product.findById(id).exec();
  }

  findByIdPopulated(id: string): Promise<ProductWithRelations | null> {
    return Product.findById(id)
      .populate('brandId', 'name logo slug isActive')
      .populate('categoryId', 'name image slug isActive')
      .exec() as Promise<ProductWithRelations | null>;
  }

  findBySku(sku: string): Promise<IProductDocument | null> {
    return Product.findOne({ sku: sku.toUpperCase() }).exec();
  }

  findBySlug(slug: string): Promise<IProductDocument | null> {
    return Product.findOne({ slug }).exec();
  }

  async updateById(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<IProductDocument | null> {
    return Product.findByIdAndUpdate(id, { $set: payload }, {
      returnDocument: 'after',
      runValidators: true,
    }).exec();
  }

  async softDelete(id: string): Promise<IProductDocument | null> {
    return Product.findByIdAndUpdate(
      id,
      { $set: { isActive: false, isAvailable: false } },
      { returnDocument: 'after' },
    ).exec();
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await Product.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async list(
    query: ProductListQuery,
  ): Promise<{ items: ProductWithRelations[]; total: number }> {
    const [items, total] = await Promise.all([
      Product.find(query.filter)
        .populate('brandId', 'name logo slug')
        .populate('categoryId', 'name image slug')
        .sort(query.sort)
        .skip(query.skip)
        .limit(query.limit)
        .exec() as Promise<ProductWithRelations[]>,
      Product.countDocuments(query.filter).exec(),
    ]);
    return { items, total };
  }
}

export const productsRepository = new ProductsRepository();
