import StatusBadge from '../ui/StatusBadge.jsx';
import TaskCompletionBadge from '../../features/tasks/TaskCompletionBadge.jsx';
import { formatDateOnly, formatDateTime } from '../../utils/formatDate.js';

/**
 * Column configs for every tab of IndividualContributionPanel.jsx (see
 * that file's docblock). Split out here purely to keep the panel
 * component focused on layout/data-fetching -- each array is only ever
 * used as a `DataTable columns={...}` prop.
 */

export const TICKET_COLUMNS = [
  { key: 'title', header: 'Title' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'priority', header: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
  { key: 'createdAt', header: 'Created', render: (row) => formatDateOnly(row.createdAt) },
  { key: 'resolvedAt', header: 'Resolved', render: (row) => (row.resolvedAt ? formatDateOnly(row.resolvedAt) : '—') },
];

/**
 * Read-only, like every other tab here -- Individual Contribution never
 * offers a way to change a task's status (see OpenTasksPanel.jsx for
 * the one place that does). This tab shows every task regardless of
 * status (see IndividualContributionPanel.jsx's `activeRows`), so
 * Status can read a plain "Todo"/"In-progress" badge or a colored
 * "Done" badge (green/yellow/red by the server-computed
 * `completionTimeliness` -- see backend/src/services/TaskService.js's
 * attachCompletionTimeliness and backend/src/utils/businessTime.js);
 * TaskCompletionBadge itself already falls back to a plain StatusBadge
 * for any non-done row, so no extra branching is needed here.
 * `completedAt` is shown with date+time (blank until the task is done),
 * since "when exactly" is the point -- it's a server-stamped fact set by
 * TaskService's `update` override the moment a task's status becomes
 * 'done', never client-editable.
 */
export const TASK_COLUMNS = [
  { key: 'title', header: 'Title' },
  { key: 'status', header: 'Status', render: (row) => <TaskCompletionBadge task={row} /> },
  { key: 'priority', header: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
  { key: 'dueDate', header: 'Due', render: (row) => (row.dueDate ? formatDateOnly(row.dueDate) : '—') },
  { key: 'completedAt', header: 'Completed', render: (row) => (row.completedAt ? formatDateTime(row.completedAt) : '—') },
];

export const APPOINTMENT_COLUMNS = [
  { key: 'title', header: 'Title' },
  { key: 'withPerson', header: 'With' },
  { key: 'scheduledAt', header: 'Scheduled', render: (row) => formatDateOnly(row.scheduledAt) },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'notes', header: 'Notes' },
];

export const VOC_COLUMNS = [
  { key: 'customerName', header: 'Customer' },
  { key: 'category', header: 'Category', render: (row) => <StatusBadge status={row.category} /> },
  { key: 'rating', header: 'Rating', render: (row) => `${row.rating}/5` },
  { key: 'feedback', header: 'Feedback' },
  { key: 'receivedAt', header: 'Received', render: (row) => formatDateOnly(row.receivedAt) },
];

export const SHOUT_OUT_COLUMNS = [
  { key: 'fromName', header: 'From' },
  { key: 'message', header: 'Message' },
  { key: 'givenAt', header: 'Given', render: (row) => formatDateOnly(row.givenAt) },
];

export const AWARD_COLUMNS = [
  { key: 'title', header: 'Title' },
  { key: 'category', header: 'Category' },
  { key: 'description', header: 'Description' },
  { key: 'awardedAt', header: 'Awarded', render: (row) => formatDateOnly(row.awardedAt) },
];
