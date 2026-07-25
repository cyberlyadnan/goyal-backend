/**
 * Categories data-access layer. All MongoDB interaction for this module belongs here.
 */
export class CategoriesRepository {
  async getStatus(): Promise<{ module: string; status: string }> {
    return { module: 'categories', status: 'scaffolded' };
  }
}

export const categoriesRepository = new CategoriesRepository();
