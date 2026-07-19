import { useEffect, useMemo, useState } from 'react';
import { CheckSquare, Ticket as TicketIcon } from 'lucide-react';

import Card from '../ui/Card.jsx';
import DataTable from '../ui/DataTable.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import useApiResource from '../../hooks/useApiResource.js';
import useYearMonthFilter from '../../hooks/useYearMonthFilter.js';
import ticketApiService from '../../api/services/ticketApiService.js';
import taskApiService from '../../api/services/taskApiService.js';
import { formatDateOnly } from '../../utils/formatDate.js';

import KpiCard from './KpiCard.jsx';
import YearMonthFilter from './YearMonthFilter.jsx';

const FETCH_ALL_PAGE_SIZE = 100; // comfortably above the ~20/10 seeded per user

const TICKET_COLUMNS = [
  { key: 'title', header: 'Title' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'priority', header: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
  { key: 'createdAt', header: 'Created', render: (row) => formatDateOnly(row.createdAt) },
  { key: 'resolvedAt', header: 'Resolved', render: (row) => (row.resolvedAt ? formatDateOnly(row.resolvedAt) : '—') },
];

const TASK_COLUMNS = [
  { key: 'title', header: 'Title' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'priority', header: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
  { key: 'dueDate', header: 'Due', render: (row) => (row.dueDate ? formatDateOnly(row.dueDate) : '—') },
];

const TABS = [
  { id: 'tickets', label: 'Tickets' },
  { id: 'tasks', label: 'Tasks' },
];

/**
 * Dashboard's Individual Contribution section: two KPI cards (Tickets,
 * Tasks) plus a tabbed, scrollable table of the current user's own
 * records. Scoped to `userId` via the `assignedTo` filter both
 * ticketApiService/taskApiService's backend routes accept, and further
 * narrowed by the shared Year/Month filter (tickets/tasks `createdAt`
 * -- see hooks/useYearMonthFilter.js and dateRangeField in
 * backend/src/controllers/ticket.controller.js + task.controller.js).
 *
 * Rendered with `key={userId}` by the parent (see pages/DashboardPage.jsx)
 * so switching the mock "logged in as" user cleanly refetches for the
 * new person instead of needing manual filter-update plumbing.
 */
export default function IndividualContributionPanel({ userId }) {
  const [activeTab, setActiveTab] = useState('tickets');
  const { year, month, setYear, setMonth, params } = useYearMonthFilter();

  const {
    data: tickets,
    isLoading: isLoadingTickets,
    setFilters: setTicketFilters,
  } = useApiResource(ticketApiService, {
    initialFilters: { assignedTo: userId },
    pageSize: FETCH_ALL_PAGE_SIZE,
  });

  const {
    data: tasks,
    isLoading: isLoadingTasks,
    setFilters: setTaskFilters,
  } = useApiResource(taskApiService, {
    initialFilters: { assignedTo: userId },
    pageSize: FETCH_ALL_PAGE_SIZE,
  });

  useEffect(() => {
    setTicketFilters({ assignedTo: userId, ...params });
    setTaskFilters({ assignedTo: userId, ...params });
  }, [userId, params, setTicketFilters, setTaskFilters]);

  const ticketOpenCount = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'open' || ticket.status === 'in-progress').length,
    [tickets],
  );
  const taskOpenCount = useMemo(
    () => tasks.filter((task) => task.status !== 'done').length,
    [tasks],
  );

  const isTicketsTab = activeTab === 'tickets';

  return (
    <Card
      title="Individual Contribution"
      className="flex h-full flex-col"
      actions={<YearMonthFilter year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Tickets"
          value={tickets.length}
          subtitle={`${ticketOpenCount} open/in-progress`}
          icon={TicketIcon}
        />
        <KpiCard label="Tasks" value={tasks.length} subtitle={`${taskOpenCount} not done`} icon={CheckSquare} />
      </div>

      <div className="mt-4 flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
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

      <div className="mt-2 max-h-80 overflow-y-auto">
        {isTicketsTab ? (
          <DataTable columns={TICKET_COLUMNS} rows={tickets} isLoading={isLoadingTickets} emptyMessage="No tickets" />
        ) : (
          <DataTable columns={TASK_COLUMNS} rows={tasks} isLoading={isLoadingTasks} emptyMessage="No tasks" />
        )}
      </div>
    </Card>
  );
}
