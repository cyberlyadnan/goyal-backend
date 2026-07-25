import { productsRepository } from '../repositories/products.repository.js';

/**
 * Products business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class ProductsService {
  constructor(private readonly repository = productsRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const productsService = new ProductsService();
