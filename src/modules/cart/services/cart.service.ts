import { cartRepository } from '../repositories/cart.repository.js';

/**
 * Cart business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class CartService {
  constructor(private readonly repository = cartRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const cartService = new CartService();
