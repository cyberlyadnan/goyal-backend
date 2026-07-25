/**
 * Builds a MongoDB text/regex search filter across the given fields.
 */
export const buildSearchFilter = (
  search: string | undefined,
  fields: string[],
): Record<string, unknown> => {
  if (!search || !search.trim() || fields.length === 0) {
    return {};
  }

  const term = search.trim();
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: escaped, $options: 'i' },
    })),
  };
};
