import { useMemo, useState } from 'react';

/**
 * Shared Year + Month filter state for dashboard widgets (see
 * components/dashboard/YearMonthFilter.jsx). Both start unset ("All"),
 * so a widget shows its full dataset until the user narrows it down.
 * `month` only takes effect once `year` is set -- `params` enforces
 * that in one place rather than every widget re-deriving it.
 */
export default function useYearMonthFilter() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const params = useMemo(() => (year ? { year, ...(month ? { month } : {}) } : {}), [year, month]);

  return { year, month, setYear, setMonth, params };
}
