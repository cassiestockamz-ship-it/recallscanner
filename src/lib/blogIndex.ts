/**
 * Indexation rule for monthly recall report pages (/blog/<month>-<year>-vehicle-recalls).
 * A month is indexable when it is within the last 24 months AND has at least 15 recall rows.
 * The current and previous month are always indexable (the timely monthly report).
 * Non-indexable months stay live (200) with robots noindex,follow and are left out of the sitemap.
 */
export const BLOG_MAX_AGE_MONTHS = 24;
export const BLOG_MIN_RECALLS = 15;

export function monthAge(month: number, year: number, now: Date = new Date()): number {
  return (now.getFullYear() * 12 + now.getMonth() + 1) - (year * 12 + month);
}

export function isBlogMonthIndexable(month: number, year: number, count: number, now: Date = new Date()): boolean {
  const age = monthAge(month, year, now);
  if (age <= 1) return true;
  return age <= BLOG_MAX_AGE_MONTHS && count >= BLOG_MIN_RECALLS;
}
