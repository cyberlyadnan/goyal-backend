/**
 * Auth data-access layer. All MongoDB interaction for this module belongs here.
 */
export class AuthRepository {
  async getStatus(): Promise<{ module: string; status: string }> {
    return { module: 'auth', status: 'scaffolded' };
  }
}

export const authRepository = new AuthRepository();
