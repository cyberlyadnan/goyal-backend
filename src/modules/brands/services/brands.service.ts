import { brandsRepository } from '../repositories/brands.repository.js';

/**
 * Brands business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class BrandsService {
  constructor(private readonly repository = brandsRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const brandsService = new BrandsService();
