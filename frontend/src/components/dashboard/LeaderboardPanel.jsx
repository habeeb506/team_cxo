import { useEffect, useRef } from 'react';

import Card from '../ui/Card.jsx';
import DataTable from '../ui/DataTable.jsx';
import useFetch from '../../hooks/useFetch.js';
import useAuth from '../../hooks/useAuth.js';
import useYearMonthFilter from '../../hooks/useYearMonthFilter.js';
import leaderboardApiService from '../../api/services/leaderboardApiService.js';
import { formatDateOnly } from '../../utils/formatDate.js';

import YearMonthFilter from './YearMonthFilter.jsx';

const COLUMNS = [
  { key: 'rank', header: '#' },
  {
    key: 'name',
    header: 'Name',
    render: (row) => (
      <div>
        <p className="font-medium text-slate-900">{row.user?.name}</p>
        <p className="text-xs text-slate-500">{row.user?.jobTitle}</p>
      </div>
    ),
  },
  { key: 'ticketsResolved', header: 'Tickets' },
  { key: 'tasksCompleted', header: 'Tasks' },
  { key: 'vocCount', header: 'VOCs' },
  { key: 'shoutOuts', header: 'Shout-outs' },
  { key: 'recognitions', header: 'Awards' },
  { key: 'overallScore', header: 'Score' },
];

/**
 * Dashboard's big, full-width Leaderboard widget: every participant
 * ranked by overallScore for a chosen period, auto-scrolled/highlighted
 * to the current user's own row. Rank is never trusted from anywhere
 * but the API response (see backend/src/services/LeaderboardService.js)
 * -- this component just renders it.
 *
 * Metric columns (Tickets/Tasks/VOCs/Shout-outs/Awards) are ordered to
 * match IndividualContributionPanel.jsx's tab order (Appointments,
 * Tickets, Tasks, VOCs, Shout-outs, Awards) for the metrics the two
 * widgets share -- Appointments has no leaderboard equivalent (nothing
 * in `LeaderboardEntry.model.js` scores it), so it's simply absent
 * here rather than skipped-with-a-gap. `recognitions` is the backend
 * field name (see LeaderboardEntry.model.js and Award.model.js's
 * docblock for how it's rolled up from `awards`) but is labeled
 * "Awards" here to read the same as the IC tab it corresponds to.
 *
 * Filtered by the shared multi-select Year/Month control (see
 * hooks/useYearMonthFilter.js) rather than a specific-date picker --
 * the backend resolves whichever weekly snapshot is most recent within
 * that selection (LeaderboardService.getEntriesForPeriod). No
 * years/months selected falls back to the latest snapshot overall.
 *
 * "Me" for the highlight/auto-scroll below comes from the real,
 * verified session (useAuth) -- not anything the client could tamper
 * with -- though note the ranking data itself was never at risk here:
 * every entry's rank always came from the API response, never from
 * anything the client computed or supplied.
 */
export default function LeaderboardPanel() {
  const { user: currentUser } = useAuth();
  const { years, months, setYears, setMonths, params } = useYearMonthFilter();
  const rowElementsRef = useRef({});
  const listContainerRef = useRef(null);

  const { data: entriesResponse, isLoading } = useFetch(
    () => leaderboardApiService.getEntries(params),
    [params],
  );
  const entries = entriesResponse?.data || [];
  const resolvedDate = entriesResponse?.date || '';

  useEffect(() => {
    const rowElement = currentUser && rowElementsRef.current[currentUser._id];
    const container = listContainerRef.current;
    if (!rowElement || !container) return;

    // Scroll only this panel's own internal list, not the page. Native
    // `scrollIntoView` walks up every scrollable ancestor -- since this
    // widget sits below the fold in the row above it, that also dragged
    // the whole Dashboard's scroll position down to here on first load.
    // Computing the target scrollTop via getBoundingClientRect (rather
    // than scrollIntoView) keeps the adjustment scoped to this
    // container alone, so the page itself never moves.
    const containerRect = container.getBoundingClientRect();
    const rowRect = rowElement.getBoundingClientRect();
    const rowTopRelativeToContainer = rowRect.top - containerRect.top + container.scrollTop;
    const targetScrollTop = rowTopRelativeToContainer - container.clientHeight / 2 + rowRect.height / 2;
    container.scrollTo({ top: Math.max(targetScrollTop, 0), behavior: 'smooth' });
    // Depend on entriesResponse (stable until a new fetch resolves)
    // rather than the `entries` array derived from it, which is a new
    // reference every render and would re-run this on every re-render.
  }, [entriesResponse, currentUser]);

  return (
    <Card
      title="Leaderboard"
      className="flex h-full flex-col"
      actions={<YearMonthFilter years={years} months={months} onYearsChange={setYears} onMonthsChange={setMonths} />}
    >
      {resolvedDate && (
        <p className="mb-2 text-xs text-slate-500">Showing snapshot from {formatDateOnly(resolvedDate)}</p>
      )}

      {!isLoading && !resolvedDate && (years.length > 0 || months.length > 0) && (
        <p className="mb-2 text-xs text-slate-500">No snapshot found for the selected period.</p>
      )}

      <div ref={listContainerRef} className="max-h-[320px] overflow-y-auto">
        <DataTable
          columns={COLUMNS}
          rows={entries}
          isLoading={isLoading}
          emptyMessage="No leaderboard data for this period"
          getRowId={(row) => row.user?._id}
          getRowClassName={(row) => (row.user?._id === currentUser?._id ? 'bg-blue-50' : '')}
          getRowRef={(row) => (element) => {
            if (row.user?._id) rowElementsRef.current[row.user._id] = element;
          }}
        />
      </div>
    </Card>
  );
}
