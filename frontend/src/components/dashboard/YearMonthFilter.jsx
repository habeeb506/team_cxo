import MultiSelect from '../ui/MultiSelect.jsx';
import { MONTH_OPTIONS, getYearOptions } from '../../constants/dateFilters.js';

const YEAR_OPTIONS = getYearOptions();

/**
 * Shared multi-select Year + Month filter control for dashboard widgets
 * that are scoped to a time period (Open Tasks, Individual Contribution,
 * Leaderboard -- not News Bulletin). Each axis is its own dropdown with
 * a "Select all" option (see components/ui/MultiSelect.jsx) and the two
 * axes are independent -- Year and Month no longer have to be picked
 * together. A "Clear all" link appears once either axis has an active
 * (partial) selection, resetting both back to "All" in one click rather
 * than requiring every checkbox to be unchecked individually. Pair with
 * hooks/useYearMonthFilter.js for the backing state.
 */
export default function YearMonthFilter({ years, months, onYearsChange, onMonthsChange }) {
  const hasActiveFilter = years.length > 0 || months.length > 0;

  const clearAll = () => {
    onYearsChange([]);
    onMonthsChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <MultiSelect
        label="Filter by year"
        placeholder="All years"
        options={YEAR_OPTIONS}
        selected={years}
        onChange={onYearsChange}
      />
      <MultiSelect
        label="Filter by month"
        placeholder="All months"
        options={MONTH_OPTIONS}
        selected={months}
        onChange={onMonthsChange}
      />
      {hasActiveFilter && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
