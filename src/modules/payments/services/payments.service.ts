import { paymentsRepository } from '../repositories/payments.repository.js';

/**
 * Payments business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class PaymentsService {
  constructor(private readonly repository = paymentsRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const paymentsService = new PaymentsService();
