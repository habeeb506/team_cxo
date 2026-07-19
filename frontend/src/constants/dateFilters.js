/**
 * Shared options for the Dashboard's Year/Month filter (see
 * components/dashboard/YearMonthFilter.jsx and hooks/useYearMonthFilter.js).
 * Used by Open Tasks, Individual Contribution, and Leaderboard -- not
 * News Bulletin, which isn't scoped to a time period.
 */
export const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

/**
 * Year options for the filter: the current year plus `yearsBack` prior
 * ones. Widen `yearsBack` if seeded/real data ever needs to reach
 * further into the past -- there's no data-driven source for this list
 * (unlike Leaderboard's old date picker, which read real snapshot
 * dates), since the same filter also applies to tickets/tasks, which
 * don't expose a "distinct years" endpoint.
 */
export function getYearOptions(yearsBack = 2) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= yearsBack; i++) {
    years.push(currentYear - i);
  }
  return years.map((year) => ({ value: String(year), label: String(year) }));
}
