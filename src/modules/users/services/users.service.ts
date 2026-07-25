import { usersRepository } from '../repositories/users.repository.js';

/**
 * Users business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class UsersService {
  constructor(private readonly repository = usersRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const usersService = new UsersService();
