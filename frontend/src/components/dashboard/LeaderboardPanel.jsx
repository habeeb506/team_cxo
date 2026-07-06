import { useEffect, useRef, useState } from 'react';

import Card from '../ui/Card.jsx';
import DataTable from '../ui/DataTable.jsx';
import Select from '../ui/Select.jsx';
import useFetch from '../../hooks/useFetch.js';
import useCurrentUser from '../../hooks/useCurrentUser.js';
import leaderboardApiService from '../../api/services/leaderboardApiService.js';
import { formatDateOnly } from '../../utils/formatDate.js';

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
  { key: 'tasksCompleted', header: 'Tasks' },
  { key: 'ticketsResolved', header: 'Tickets' },
  { key: 'vocCount', header: 'VOCs' },
  { key: 'shoutOuts', header: 'Shout-outs' },
  { key: 'recognitions', header: 'Recognitions' },
  { key: 'overallScore', header: 'Score' },
];

/**
 * Dashboard's Leaderboard panel: every participant ranked by
 * overallScore for a chosen snapshot date, auto-scrolled/highlighted to
 * the current user's own row. Rank is never trusted from anywhere but
 * the API response (see backend/src/services/LeaderboardService.js) --
 * this component just renders it.
 */
export default function LeaderboardPanel() {
  const { currentUser } = useCurrentUser();
  const [selectedDate, setSelectedDate] = useState('');
  const rowElementsRef = useRef({});

  const { data: datesResponse } = useFetch(() => leaderboardApiService.getDates(), []);
  const availableDates = datesResponse?.data || [];

  const { data: entriesResponse, isLoading } = useFetch(
    () => leaderboardApiService.getEntries(selectedDate || undefined),
    [selectedDate],
  );
  const entries = entriesResponse?.data || [];
  const resolvedDate = entriesResponse?.date || '';

  useEffect(() => {
    const rowElement = currentUser && rowElementsRef.current[currentUser._id];
    if (rowElement) {
      rowElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    // Depend on entriesResponse (stable until a new fetch resolves)
    // rather than the `entries` array derived from it, which is a new
    // reference every render and would re-run this on every re-render.
  }, [entriesResponse, currentUser]);

  return (
    <Card
      title="Leaderboard"
      className="flex h-full flex-col"
      actions={
        <Select
          aria-label="Snapshot date"
          value={selectedDate || resolvedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="py-1 text-xs"
          options={availableDates.map((date) => ({ value: date, label: formatDateOnly(date) }))}
        />
      }
    >
      <div className="max-h-[520px] overflow-y-auto">
        <DataTable
          columns={COLUMNS}
          rows={entries}
          isLoading={isLoading}
          emptyMessage="No leaderboard data for this date"
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
