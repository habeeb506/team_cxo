import { useEffect, useMemo, useState } from 'react';
import { Award as AwardIcon, Calendar, CheckSquare, Megaphone, MessageSquare, Ticket as TicketIcon } from 'lucide-react';

import Card from '../ui/Card.jsx';
import DataTable from '../ui/DataTable.jsx';
import Button from '../ui/Button.jsx';
import useApiResource from '../../hooks/useApiResource.js';
import useYearMonthFilter from '../../hooks/useYearMonthFilter.js';
import useTaskStatusSync from '../../hooks/useTaskStatusSync.js';
import myTicketsApiService from '../../api/services/myTicketsApiService.js';
import myTasksApiService from '../../api/services/myTasksApiService.js';
import myAppointmentsApiService from '../../api/services/myAppointmentsApiService.js';
import myVocsApiService from '../../api/services/myVocsApiService.js';
import myShoutOutsApiService from '../../api/services/myShoutOutsApiService.js';
import myAwardsApiService from '../../api/services/myAwardsApiService.js';
import { formatDateOnly } from '../../utils/formatDate.js';
import RecordViewModal from '../management/RecordViewModal.jsx';

import KpiCard from './KpiCard.jsx';
import YearMonthFilter from './YearMonthFilter.jsx';
import { TASK_VIEW_FIELDS } from './taskDetailFields.js';
import {
  TICKET_COLUMNS,
  TASK_COLUMNS,
  APPOINTMENT_COLUMNS,
  VOC_COLUMNS,
  SHOUT_OUT_COLUMNS,
  AWARD_COLUMNS,
} from './individualContributionColumns.jsx';

const FETCH_ALL_PAGE_SIZE = 100; // comfortably above the seeded-per-user counts for every tab

/** Most recent value of `field` across `rows`, formatted as a date, or an em dash when empty. */
function latestDateLabel(rows, field) {
  if (!rows.length) return '—';
  const latest = rows.reduce((max, row) => (new Date(row[field]) > new Date(max[field]) ? row : max), rows[0]);
  return formatDateOnly(latest[field]);
}

// Each tab pairs an apiService (its `GET .../mine` endpoint -- see
// api/services/my*ApiService.js) with an empty-state message and a
// `summarize(rows)` that returns this tab's own pair of KPI cards --
// see the panel's docblock for why the KPI cards switch with the tab
// instead of staying fixed on Tickets/Tasks.
const TAB_DEFS = [
  {
    id: 'appointments',
    label: 'Appointments',
    apiService: myAppointmentsApiService,
    emptyMessage: 'No appointments',
    summarize: (rows) => [
      { label: 'Total Appointments', value: rows.length, icon: Calendar },
      { label: 'Upcoming', value: rows.filter((row) => row.status === 'scheduled').length, icon: Calendar },
    ],
  },
  {
    id: 'tickets',
    label: 'Tickets',
    apiService: myTicketsApiService,
    emptyMessage: 'No tickets',
    summarize: (rows) => [
      { label: 'Total Tickets', value: rows.length, icon: TicketIcon },
      {
        label: 'Open / In-progress',
        value: rows.filter((row) => row.status === 'open' || row.status === 'in-progress').length,
        icon: TicketIcon,
      },
    ],
  },
  {
    id: 'tasks',
    label: 'Tasks',
    apiService: myTasksApiService,
    emptyMessage: 'No tasks',
    // Shows every task regardless of status -- the same full-history
    // shape every other tab already has (see this panel's docblock).
    // The companion metric is "Completed" (status === 'done'), mirroring
    // the Tickets tab's "Total / subset" pairing -- "Most Recent" (by
    // completedAt) only made sense back when this tab only ever held
    // already-done rows.
    summarize: (rows) => [
      { label: 'Total Tasks', value: rows.length, icon: CheckSquare },
      { label: 'Completed', value: rows.filter((row) => row.status === 'done').length, icon: CheckSquare },
    ],
  },
  {
    id: 'vocs',
    label: 'VOCs',
    apiService: myVocsApiService,
    emptyMessage: 'No VOC records',
    summarize: (rows) => [
      { label: 'Total VOCs', value: rows.length, icon: MessageSquare },
      {
        label: 'Avg Rating',
        value: rows.length ? `${(rows.reduce((sum, row) => sum + (row.rating || 0), 0) / rows.length).toFixed(1)}/5` : '—',
        icon: MessageSquare,
      },
    ],
  },
  {
    id: 'shout-outs',
    label: 'Shout-outs',
    apiService: myShoutOutsApiService,
    emptyMessage: 'No shout-outs',
    summarize: (rows) => [
      { label: 'Total Shout-outs', value: rows.length, icon: Megaphone },
      { label: 'Most Recent', value: latestDateLabel(rows, 'givenAt'), icon: Megaphone },
    ],
  },
  {
    id: 'awards',
    label: 'Awards',
    apiService: myAwardsApiService,
    emptyMessage: 'No awards',
    summarize: (rows) => [
      { label: 'Total Awards', value: rows.length, icon: AwardIcon },
      { label: 'Most Recent', value: latestDateLabel(rows, 'awardedAt'), icon: AwardIcon },
    ],
  },
];

/**
 * Dashboard's Individual Contribution section: a tabbed, scrollable
 * table of the signed-in user's own records across six resources, in
 * this order -- Appointments, Tickets, Tasks, VOCs, Shout-outs, Awards
 * (see TAB_DEFS below; LeaderboardPanel.jsx's columns follow the same
 * order for the metrics that have a leaderboard equivalent) -- with two
 * KPI cards above the table. The KPI cards always describe *the
 * currently active tab*, not a fixed Tickets/Tasks pair -- see each TAB_DEFS entry's
 * `summarize(rows)` for what "total" and its companion metric mean for
 * that specific resource (open/in-progress count, avg rating, most
 * recent date, ...).
 *
 * Every tab hits its resource's `GET .../mine` endpoint (see TAB_DEFS
 * above and each api/services/my*ApiService.js), which the backend
 * scopes to the verified session -- see those files' docblocks and each
 * resource's controller's getMine. There's deliberately no `userId`
 * prop here: before the `/mine` endpoints existed, this panel asked for
 * `?assignedTo=<id>` using whichever id the old mock "logged in as"
 * switcher had locally, which meant any browser could view anyone
 * else's contribution data just by changing that id client-side.
 *
 * Every tab applies no client-side status filter at all: every row
 * `useApiResource` fetches is rendered, including cancelled
 * appointments, closed/resolved tickets, and not-yet-finished tasks --
 * meant to be the complete history, not just what's still outstanding.
 * That narrower "what's still outstanding" view is Open Tasks' job (see
 * that panel's docblock) -- the Tasks tab here used to filter down to
 * `status === 'done'` only ("Completed Tasks"), but now shows the same
 * full history as every other tab.
 *
 * Unlike Open Tasks, this panel never offers a way to change a task's
 * status -- the Tasks tab's Status column is a plain read-only
 * `StatusBadge` (`TASK_COLUMNS` in individualContributionColumns.jsx),
 * the same shape as every other tab's Status column. Status edits only
 * happen from Open Tasks (`components/dashboard/OpenTasksPanel.jsx`);
 * this panel is display-only for tasks, full stop. The server still
 * stamps `completedAt` automatically the moment a task's status becomes
 * 'done' (backend/src/services/TaskService.js's `update` override), so
 * "when it was actually finished" is never something the client can
 * fake or backdate -- it's just never edited *from here*.
 *
 * Live sync with Open Tasks: this panel calls `useTaskStatusSync(tasks.refetch)`
 * (`hooks/useTaskStatusSync.js`), so even though it can't trigger a
 * status change itself, it still refetches the moment one happens in
 * Open Tasks (see `utils/taskEvents.js`) -- marking a task done there
 * updates its Status badge here immediately, no page refresh needed.
 *
 * The Tasks tab's rows also get a View button (`taskColumnsWithView`
 * below), opening the same `RecordViewModal` + `TASK_VIEW_FIELDS`
 * (`./taskDetailFields.js`) that OpenTasksPanel.jsx's View button
 * opens -- the one place a task's status *can* be changed is still
 * only Open Tasks; this is read-only detail, not a second edit path.
 * The other five tabs don't get a View button/column -- this was added
 * specifically for tasks, not as a general per-row action.
 *
 * Defaults to the current year/month (`defaultToCurrentPeriod: true`)
 * so the panel opens scoped to "this month" rather than all-time --
 * distinct from Open Tasks/Leaderboard, which default to "All" (see
 * hooks/useYearMonthFilter.js). Every tab shares the same Year/Month
 * filter and "Clear all" link (see YearMonthFilter.jsx).
 */
export default function IndividualContributionPanel() {
  const [activeTab, setActiveTab] = useState(TAB_DEFS[0].id);
  const { years, months, setYears, setMonths, params } = useYearMonthFilter({ defaultToCurrentPeriod: true });

  // Fixed set of six resources -- calling useApiResource once per
  // resource (rather than dynamically) keeps this a stable list of
  // hook calls, which React requires.
  const tickets = useApiResource(myTicketsApiService, { pageSize: FETCH_ALL_PAGE_SIZE });
  const tasks = useApiResource(myTasksApiService, { pageSize: FETCH_ALL_PAGE_SIZE });
  const appointments = useApiResource(myAppointmentsApiService, { pageSize: FETCH_ALL_PAGE_SIZE });
  const vocs = useApiResource(myVocsApiService, { pageSize: FETCH_ALL_PAGE_SIZE });
  const shoutOuts = useApiResource(myShoutOutsApiService, { pageSize: FETCH_ALL_PAGE_SIZE });
  const awards = useApiResource(myAwardsApiService, { pageSize: FETCH_ALL_PAGE_SIZE });

  const resourcesByTab = useMemo(
    () => ({
      tickets,
      tasks,
      appointments,
      vocs,
      'shout-outs': shoutOuts,
      awards,
    }),
    [tickets, tasks, appointments, vocs, shoutOuts, awards],
  );

  useEffect(() => {
    Object.values(resourcesByTab).forEach((resource) => resource.setFilters({ ...params }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useTaskStatusSync(tasks.refetch);
  const [viewingTask, setViewingTask] = useState(null);

  // Only the Tasks tab gets a View button/column -- see this panel's
  // docblock. The other five tabs' columns are used as-is, straight
  // from individualContributionColumns.jsx.
  const taskColumnsWithView = [
    ...TASK_COLUMNS,
    {
      key: '__view',
      header: '',
      sticky: 'right',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setViewingTask(row)}>
          View
        </Button>
      ),
    },
  ];

  const columnsByTab = {
    tickets: TICKET_COLUMNS,
    tasks: taskColumnsWithView,
    appointments: APPOINTMENT_COLUMNS,
    vocs: VOC_COLUMNS,
    'shout-outs': SHOUT_OUT_COLUMNS,
    awards: AWARD_COLUMNS,
  };

  const activeTabDef = TAB_DEFS.find((tab) => tab.id === activeTab) ?? TAB_DEFS[0];
  const activeResource = resourcesByTab[activeTabDef.id];
  // Every tab renders its resource's full fetched history unfiltered --
  // see this panel's docblock -- so this is just the active resource's
  // data as-is, feeding both the table rows and the KPI cards below.
  const activeRows = activeResource.data;
  const kpiCards = useMemo(() => activeTabDef.summarize(activeRows), [activeTabDef, activeRows]);

  return (
    <Card
      title="Individual Contribution"
      className="flex h-full flex-col"
      actions={<YearMonthFilter years={years} months={months} onYearsChange={setYears} onMonthsChange={setMonths} />}
    >
      <div className="grid grid-cols-2 gap-3">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TAB_DEFS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-2 max-h-40 overflow-y-auto">
        <DataTable
          columns={columnsByTab[activeTabDef.id]}
          rows={activeRows}
          isLoading={activeResource.isLoading}
          emptyMessage={activeTabDef.emptyMessage}
        />
      </div>

      <RecordViewModal
        isOpen={Boolean(viewingTask)}
        record={viewingTask}
        fields={TASK_VIEW_FIELDS}
        resourceLabel="Task"
        onClose={() => setViewingTask(null)}
      />
    </Card>
  );
}
