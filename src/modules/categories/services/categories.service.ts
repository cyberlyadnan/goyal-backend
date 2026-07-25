import { categoriesRepository } from '../repositories/categories.repository.js';

/**
 * Categories business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class CategoriesService {
  constructor(private readonly repository = categoriesRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const categoriesService = new CategoriesService();
