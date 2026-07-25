import { authRepository } from '../repositories/auth.repository.js';

/**
 * Auth business logic. Controllers stay thin; repositories talk to MongoDB.
 */
export class AuthService {
  constructor(private readonly repository = authRepository) {}

  async getModuleStatus(): Promise<{ module: string; status: string }> {
    return this.repository.getStatus();
  }
}

export const authService = new AuthService();
