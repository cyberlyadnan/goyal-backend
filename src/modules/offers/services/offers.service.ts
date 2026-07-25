import { offersRepository } from '../repositories/offers.repository.js';

/**
 * Offers business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class OffersService {
  constructor(private readonly repository = offersRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const offersService = new OffersService();
