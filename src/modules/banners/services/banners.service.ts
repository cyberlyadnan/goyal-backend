import { bannersRepository } from '../repositories/banners.repository.js';

/**
 * Banners business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class BannersService {
  constructor(private readonly repository = bannersRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const bannersService = new BannersService();
