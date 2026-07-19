import Select from '../ui/Select.jsx';
import { MONTH_OPTIONS, getYearOptions } from '../../constants/dateFilters.js';

const YEAR_OPTIONS = getYearOptions();

/**
 * Shared Year + Month filter control for dashboard widgets that are
 * scoped to a time period (Open Tasks, Individual Contribution,
 * Leaderboard -- not News Bulletin). Month is disabled until a Year is
 * chosen, since "just a month, any year" isn't a meaningful filter
 * here. Pair with hooks/useYearMonthFilter.js for the backing state.
 */
export default function YearMonthFilter({ year, month, onYearChange, onMonthChange }) {
  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Filter by year"
        value={year}
        onChange={(event) => onYearChange(event.target.value)}
        placeholder="All years"
        options={YEAR_OPTIONS}
        className="py-1 text-xs"
      />
      <Select
        aria-label="Filter by month"
        value={month}
        onChange={(event) => onMonthChange(event.target.value)}
        placeholder="All months"
        options={MONTH_OPTIONS}
        disabled={!year}
        className="py-1 text-xs"
      />
    </div>
  );
}
