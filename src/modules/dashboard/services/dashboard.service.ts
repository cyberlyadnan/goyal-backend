import { dashboardRepository } from '../repositories/dashboard.repository.js';

/**
 * Dashboard business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class DashboardService {
  constructor(private readonly repository = dashboardRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const dashboardService = new DashboardService();
