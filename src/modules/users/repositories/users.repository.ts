/**
 * Users data-access layer. All MongoDB interaction for this module belongs here.
 */
export class UsersRepository {
  async getStatus(): Promise<{ module: string; status: string }> {
    return { module: 'users', status: 'scaffolded' };
  }
}

export const usersRepository = new UsersRepository();
