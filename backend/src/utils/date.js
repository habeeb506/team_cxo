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

/**
 * Returns the [start, end) UTC Date range for one calendar month (when
 * `month` is a 1-12 number) or, if `month` is omitted, one whole
 * calendar year. Used to turn a `?year=&month=` dashboard filter into a
 * single Mongo range query ($gte start, $lt end) against a timestamp
 * field -- see utils/queryOptions.js's `dateRangeField` option.
 */
export function getUtcMonthRange(year, month) {
  const y = Number(year);
  if (typeof month === 'number' && !Number.isNaN(month)) {
    const start = new Date(Date.UTC(y, month - 1, 1));
    const end = new Date(Date.UTC(y, month, 1));
    return { start, end };
  }
  const start = new Date(Date.UTC(y, 0, 1));
  const end = new Date(Date.UTC(y + 1, 0, 1));
  return { start, end };
}
