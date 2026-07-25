/**
 * Banners data-access layer. All MongoDB interaction for this module belongs here.
 */
export class BannersRepository {
  async getStatus(): Promise<{ module: string; status: string }> {
    return { module: 'banners', status: 'scaffolded' };
  }
}

export const bannersRepository = new BannersRepository();
