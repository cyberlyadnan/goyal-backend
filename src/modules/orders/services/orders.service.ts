import { ordersRepository } from '../repositories/orders.repository.js';

/**
 * Orders business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class OrdersService {
  constructor(private readonly repository = ordersRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const ordersService = new OrdersService();
