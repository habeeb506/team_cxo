import { useMemo, useState } from 'react';

import Card from '../ui/Card.jsx';
import DataTable from '../ui/DataTable.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Button from '../ui/Button.jsx';
import useApiResource from '../../hooks/useApiResource.js';
import useTaskStatusUpdate from '../../hooks/useTaskStatusUpdate.js';
import useTaskStatusSync from '../../hooks/useTaskStatusSync.js';
import myTasksApiService from '../../api/services/myTasksApiService.js';
import { formatDateOnly } from '../../utils/formatDate.js';
import RecordViewModal from '../management/RecordViewModal.jsx';

import TaskStatusSelect from './TaskStatusSelect.jsx';
import { TASK_VIEW_FIELDS } from './taskDetailFields.js';

const FETCH_ALL_PAGE_SIZE = 100; // comfortably above the ~10 seeded per user
const NO_DUE_DATE_SORT_VALUE = 8640000000000000; // sorts tasks with no due date last

function isOverdue(task) {
  return Boolean(task.dueDate) && new Date(task.dueDate) < new Date();
}

/**
 * Dashboard's Open Tasks widget: a focused, at-a-glance list of the
 * signed-in user's not-yet-finished tasks, soonest due date first,
 * distinct from Individual Contribution's fuller Tickets+Tasks
 * history/KPIs (which shows every status, including finished/cancelled
 * ones -- see that panel's docblock). "Open" here means
 * `status === 'todo' || status === 'in-progress'` -- only finished
 * ('done') tasks are excluded, applied as a client-side filter rather
 * than a new backend query param. A task marked 'done' via the quick-edit
 * Status column below disappears from this list on the next fetch, but
 * keeps showing up in Individual Contribution's Tasks tab -- "open" and
 * "everything" are deliberately different views over the same data.
 *
 * Uses myTasksApiService (`GET /tasks/mine`), which the backend scopes
 * to the verified session -- see api/services/myTasksApiService.js and
 * backend/src/controllers/task.controller.js's getMine. There's
 * deliberately no `userId` prop here anymore: whose tasks these are is
 * never something this component (or its parent) decides.
 *
 * No Year/Month filter here (unlike Individual Contribution/Leaderboard)
 * -- this panel already shows exactly one thing, "tasks that are open
 * right now", and a date filter would only let a user filter that view
 * down to nothing without changing what "open" means. It always fetches
 * the full unfiltered set of the user's own tasks.
 *
 * The Status column is a live quick-edit control (`TaskStatusSelect`),
 * not just a badge -- see hooks/useTaskStatusUpdate.js for the PATCH +
 * cache-invalidation behind it. Once a task's status becomes 'done', it
 * naturally drops out of this list on the next fetch since it no longer
 * matches the open-tasks filter above -- and that fetch happens right
 * away, without a page refresh, whether the edit was made here or from
 * Individual Contribution's Tasks tab (see hooks/useTaskStatusSync.js).
 *
 * Each row also has a View button opening `RecordViewModal` (the same
 * generic detail-view modal the Tasks admin page's own View button
 * uses -- see components/management/ManagementPage.jsx), fed by
 * `TASK_VIEW_FIELDS` (`./taskDetailFields.js`) instead of that page's
 * full `buildTaskFields` -- this widget already knows whose task it is,
 * so there's no `assignedTo` field to show.
 */
export default function OpenTasksPanel() {
  const { data: tasks, isLoading, refetch } = useApiResource(myTasksApiService, {
    pageSize: FETCH_ALL_PAGE_SIZE,
  });

  const { updateStatus, savingId } = useTaskStatusUpdate(myTasksApiService.resourcePath);
  useTaskStatusSync(refetch);
  const [viewingTask, setViewingTask] = useState(null);

  const openTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status === 'todo' || task.status === 'in-progress')
        .sort(
          (a, b) =>
            new Date(a.dueDate ?? NO_DUE_DATE_SORT_VALUE) - new Date(b.dueDate ?? NO_DUE_DATE_SORT_VALUE),
        ),
    [tasks],
  );

  const columns = useMemo(
    () => [
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
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <TaskStatusSelect
            task={row}
            isSaving={savingId === (row.id ?? row._id)}
            onChange={updateStatus}
          />
        ),
      },
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
    ],
    [savingId, updateStatus],
  );

  return (
    <Card title="Open Tasks" className="flex h-full flex-col">
      <div className="max-h-[130px] overflow-y-auto">
        <DataTable
          columns={columns}
          rows={openTasks}
          isLoading={isLoading}
          emptyMessage="No open tasks right now"
          getRowClassName={(row) => (isOverdue(row) ? 'bg-red-50' : '')}
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
