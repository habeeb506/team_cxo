import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { cn } from '../../utils/cn.js';

const TIMELINESS_COLOR_CLASSES = {
  'on-time': 'bg-emerald-100 text-emerald-700',
  delayed: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
};

// Deliberately the same label for every value -- the color alone is what
// distinguishes on-time/delayed/overdue (see TIMELINESS_COLOR_CLASSES
// above); the badge text always just reads "Done".
const TIMELINESS_LABELS = {
  'on-time': 'Done',
  delayed: 'Done',
  overdue: 'Done',
};

/**
 * Status badge for a task row, placed in `features/tasks/` (rather than
 * `components/dashboard/`) specifically so it can be imported by both
 * `task.management.config.js` (Tasks admin page) and
 * `components/dashboard/individualContributionColumns.jsx` (Individual
 * Contribution's Tasks tab) without an awkward
 * features-importing-from-dashboard-components direction.
 *
 * Colors a done task green/yellow/red based on `task.completionTimeliness`
 * -- computed server-side in backend/src/services/TaskService.js's
 * attachCompletionTimeliness (see backend/src/utils/businessTime.js for
 * the weekend/holiday-aware delay math behind it):
 *   - 'on-time' (green)  -- completed at or before the due date/time
 *   - 'delayed' (yellow) -- completed late, but within 24 business hours
 *   - 'overdue' (red)    -- completed more than 24 business hours late
 *
 * Falls back to the plain read-only StatusBadge for any non-done status,
 * or a done task with no `completionTimeliness` (e.g. it never had a
 * due date, so there's nothing to compare its completion time against).
 * This is purely a display component -- it never offers a way to change
 * status; that stays exclusively in OpenTasksPanel/TaskStatusSelect.
 */
export default function TaskCompletionBadge({ task }) {
  const timeliness = task?.completionTimeliness;

  if (task?.status !== 'done' || !timeliness) {
    return <StatusBadge status={task?.status} />;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        TIMELINESS_COLOR_CLASSES[timeliness] || 'bg-slate-100 text-slate-700',
      )}
    >
      {TIMELINESS_LABELS[timeliness] || 'Done'}
    </span>
  );
}
