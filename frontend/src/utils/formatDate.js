/**
 * Shared date/time formatting helpers so every widget renders dates
 * consistently instead of each one calling toLocaleString with its own
 * options.
 */

/** e.g. "Jul 4, 2026, 3:45 PM" -- used wherever both date and time matter. */
export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** e.g. "Jul 4, 2026" -- used wherever only the date matters. */
export function formatDateOnly(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
