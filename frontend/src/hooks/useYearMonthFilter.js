import { useMemo, useState } from 'react';

import { MONTH_OPTIONS, getYearOptions } from '../constants/dateFilters.js';

const YEAR_OPTION_COUNT = getYearOptions().length;
const MONTH_OPTION_COUNT = MONTH_OPTIONS.length;

/** The current calendar year/month as the same string values MultiSelect options use ('2026', '8', not zero-padded). */
function getCurrentPeriod() {
  const now = new Date();
  return { year: String(now.getFullYear()), month: String(now.getMonth() + 1) };
}

/**
 * Shared multi-select Year + Month filter state for dashboard widgets
 * (see components/dashboard/YearMonthFilter.jsx, components/ui/MultiSelect.jsx).
 * By default both axes start empty ("All"), so a widget shows its full
 * dataset until narrowed down -- pass `{ defaultToCurrentPeriod: true }`
 * for a widget that should instead start scoped to the current
 * year+month (Individual Contribution does this; Open Tasks and
 * Leaderboard don't, so they keep showing everything until a user
 * narrows it down). Either way, selecting every option (the UI's
 * "Select all") is treated the same as selecting none -- both collapse
 * to "no restriction on that axis" in `params`, so the request never
 * sends a pointless "every possible value" list and the backend
 * (utils/queryOptions.js's buildListQueryOptions) never has to
 * special-case "all of them" vs "unset".
 *
 * Year and Month are independent filters (backed by MongoDB's
 * `$year`/`$month` date-expression matching -- see buildListQueryOptions)
 * -- picking only months with no years selected is a valid "every
 * March, any year" filter, not ignored.
 */
export default function useYearMonthFilter({ defaultToCurrentPeriod = false } = {}) {
  const [years, setYears] = useState(() => (defaultToCurrentPeriod ? [getCurrentPeriod().year] : []));
  const [months, setMonths] = useState(() => (defaultToCurrentPeriod ? [getCurrentPeriod().month] : []));

  const params = useMemo(() => {
    const next = {};
    if (years.length > 0 && years.length < YEAR_OPTION_COUNT) next.years = years.join(',');
    if (months.length > 0 && months.length < MONTH_OPTION_COUNT) next.months = months.join(',');
    return next;
  }, [years, months]);

  return { years, months, setYears, setMonths, params };
}
