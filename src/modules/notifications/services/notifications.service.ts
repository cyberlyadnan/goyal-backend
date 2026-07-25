import { notificationsRepository } from '../repositories/notifications.repository.js';

/**
 * Notifications business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class NotificationsService {
  constructor(private readonly repository = notificationsRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const notificationsService = new NotificationsService();
