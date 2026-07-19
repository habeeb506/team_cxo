import { useEffect, useMemo } from 'react';

import Card from '../ui/Card.jsx';
import DataTable from '../ui/DataTable.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import useApiResource from '../../hooks/useApiResource.js';
import useYearMonthFilter from '../../hooks/useYearMonthFilter.js';
import taskApiService from '../../api/services/taskApiService.js';
import { formatDateOnly } from '../../utils/formatDate.js';

import YearMonthFilter from './YearMonthFilter.jsx';

const FETCH_ALL_PAGE_SIZE = 100; // comfortably above the ~10 seeded per user
const NO_DUE_DATE_SORT_VALUE = 8640000000000000; // sorts tasks with no due date last

function isOverdue(task) {
  return Boolean(task.dueDate) && new Date(task.dueDate) < new Date();
}

const COLUMNS = [
  { key: 'title', header: 'Title' },
  { key: 'priority', header: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
  {
    key: 'dueDate',
    header: 'Due',
    render: (row) => (
      <span className={isOverdue(row) ? 'font-medium text-red-600' : ''}>
        {row.dueDate ? formatDateOnly(row.dueDate) : '—'}
      </span>
    ),
  },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

/**
 * Dashboard's Open Tasks widget: a focused, at-a-glance list of the
 * current user's not-yet-done tasks, soonest due date first, distinct
 * from Individual Contribution's fuller Tickets+Tasks history/KPIs.
 * Reuses the same `taskApiService` -- "open" is a client-side filter
 * (status !== 'done') rather than a new backend query param, matching
 * how Individual Contribution already derives its open-task count.
 *
 * Filterable by Year/Month (task.createdAt on the backend -- see
 * hooks/useYearMonthFilter.js and dateRangeField in
 * backend/src/controllers/task.controller.js).
 *
 * Rendered with `key={userId}` by the parent (see pages/DashboardPage.jsx)
 * so switching the mock "logged in as" user cleanly refetches.
 */
export default function OpenTasksPanel({ userId }) {
  const { year, month, setYear, setMonth, params } = useYearMonthFilter();

  const { data: tasks, isLoading, setFilters } = useApiResource(taskApiService, {
    initialFilters: { assignedTo: userId },
    pageSize: FETCH_ALL_PAGE_SIZE,
  });

  useEffect(() => {
    setFilters({ assignedTo: userId, ...params });
  }, [userId, params, setFilters]);

  const openTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status !== 'done')
        .sort(
          (a, b) =>
            new Date(a.dueDate ?? NO_DUE_DATE_SORT_VALUE) - new Date(b.dueDate ?? NO_DUE_DATE_SORT_VALUE),
        ),
    [tasks],
  );

  return (
    <Card
      title="Open Tasks"
      className="flex h-full flex-col"
      actions={<YearMonthFilter year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />}
    >
      <div className="max-h-[520px] overflow-y-auto">
        <DataTable
          columns={COLUMNS}
          rows={openTasks}
          isLoading={isLoading}
          emptyMessage="No open tasks — you're all caught up"
          getRowClassName={(row) => (isOverdue(row) ? 'bg-red-50' : '')}
        />
      </div>
    </Card>
  );
}
