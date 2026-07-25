/**
 * Offers data-access layer. All MongoDB interaction for this module belongs here.
 */
export class OffersRepository {
  async getStatus(): Promise<{ module: string; status: string }> {
    return { module: 'offers', status: 'scaffolded' };
  }
}

export const offersRepository = new OffersRepository();
