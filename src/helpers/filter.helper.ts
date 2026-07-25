/**
 * Builds an equality / $in filter from query params, ignoring undefined/empty values.
 */
export const buildFilter = (
  query: Record<string, unknown>,
  allowedFields: string[],
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  for (const field of allowedFields) {
    const value = query[field];
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (typeof value === 'string' && value.includes(',')) {
      filter[field] = { $in: value.split(',').map((v) => v.trim()) };
      continue;
    }

    filter[field] = value;
  }

  return filter;
};
