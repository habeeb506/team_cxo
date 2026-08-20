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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Resolves a 'day' | 'week' | 'month' period (containing `dateInput`,
 * default today) into a `[start, end)` UTC date range -- used by
 * TeamRosterService.getStats for the roster stats bar's Day/Week/Month
 * scope. `end` is exclusive, so callers filter with `{ $gte: start, $lt: end }`.
 * 'week' is Monday-Sunday (ISO week), not a rolling "last 7 days".
 */
export function resolvePeriodRange(period, dateInput) {
  const anchor = toUtcDateOnly(dateInput ?? new Date());

  if (period === 'week') {
    // getUTCDay(): 0=Sun..6=Sat. Days since the most recent Monday.
    const daysSinceMonday = (anchor.getUTCDay() + 6) % 7;
    const start = new Date(anchor.getTime() - daysSinceMonday * MS_PER_DAY);
    const end = new Date(start.getTime() + 7 * MS_PER_DAY);
    return { start, end };
  }

  if (period === 'month') {
    const start = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
    const end = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 1));
    return { start, end };
  }

  // 'day' (default)
  const start = anchor;
  const end = new Date(start.getTime() + MS_PER_DAY);
  return { start, end };
}
