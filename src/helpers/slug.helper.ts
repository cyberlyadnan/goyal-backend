/**
 * Converts a display name into a URL-safe slug.
 */
export const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Ensures uniqueness by appending a short suffix when needed.
 */
export const uniqueSlug = (base: string, suffix?: string | number): string => {
  const slug = slugify(base);
  if (!suffix) {
    return slug;
  }
  return `${slug}-${String(suffix).toLowerCase()}`;
};
