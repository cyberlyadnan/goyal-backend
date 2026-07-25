export interface SortInput {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | string;
  allowedFields?: string[];
  defaultSort?: Record<string, 1 | -1>;
}

/**
 * Builds a MongoDB sort object from query params.
 */
export const buildSort = ({
  sortBy,
  sortOrder = 'desc',
  allowedFields = [],
  defaultSort = { createdAt: -1 },
}: SortInput = {}): Record<string, 1 | -1> => {
  if (!sortBy) {
    return defaultSort;
  }

  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    return defaultSort;
  }

  const order: 1 | -1 = sortOrder === 'asc' ? 1 : -1;
  return { [sortBy]: order };
};
