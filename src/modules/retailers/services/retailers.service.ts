import { retailersRepository } from '../repositories/retailers.repository.js';

/**
 * Retailers business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class RetailersService {
  constructor(private readonly repository = retailersRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const retailersService = new RetailersService();
