import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '../../features/tasks/task.constants.js';
import { formatDateOnly, formatDateTime } from '../../utils/formatDate.js';

/**
 * Field config for the read-only "View" modal both OpenTasksPanel and
 * IndividualContributionPanel's Tasks tab open for a task row
 * -- same shape (`{ name, label, formatValue?, type?, options? }`) and
 * the same `components/management/RecordViewModal.jsx` every management
 * page's own View button already renders, so a task viewed from the
 * Dashboard looks like the same detail view as the Tasks admin page's
 * (`features/tasks/task.management.config.js`'s `buildTaskFields`),
 * just without an `assignedTo` field -- every task shown on these two
 * widgets is already scoped to the signed-in user via `/tasks/mine`, so
 * "assigned to yourself" would be redundant here.
 */
export const TASK_VIEW_FIELDS = [
  { name: 'title', label: 'Title' },
  { name: 'description', label: 'Description' },
  { name: 'status', label: 'Status', type: 'select', options: TASK_STATUS_OPTIONS },
  { name: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITY_OPTIONS },
  { name: 'dueDate', label: 'Due Date', formatValue: (value) => (value ? formatDateOnly(value) : '—') },
  { name: 'completedAt', label: 'Completed At', formatValue: (value) => (value ? formatDateTime(value) : '—') },
  { name: 'createdAt', label: 'Created', formatValue: (value) => (value ? formatDateTime(value) : '—') },
];
