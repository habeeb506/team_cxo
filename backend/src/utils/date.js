/**
 * Normalizes a date (a 'YYYY-MM-DD' string, a Date, or anything else
 * `Date` accepts) to midnight UTC of that calendar day. Used wherever a
 * date represents a whole day rather than a timestamp (currently
 * LeaderboardEntry.snapshotDate) so equality queries and comparisons
 * are exact instead of drifting on time-of-day/timezone.
 */
export function toUtcDateOnly(input) {
  const date = new Date(input);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Formats a Date back to 'YYYY-MM-DD' (UTC), the inverse of toUtcDateOnly. */
export function formatUtcDateOnly(date) {
  return new Date(date).toISOString().slice(0, 10);
}
