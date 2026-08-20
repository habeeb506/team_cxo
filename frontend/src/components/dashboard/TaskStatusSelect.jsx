import Select from '../ui/Select.jsx';
import { TASK_STATUS_OPTIONS } from '../../features/tasks/task.constants.js';

/**
 * Inline quick-edit control for one task's status, dropped directly
 * into a DataTable row (see OpenTasksPanel.jsx and
 * IndividualContributionPanel.jsx's Tasks tab) so a user can update
 * their own task without leaving the Dashboard or opening the full
 * Tasks admin page. Purely presentational -- the actual PATCH, the
 * server-side `completedAt` stamping, and the saving/error state all
 * live in hooks/useTaskStatusUpdate.js; this component just renders the
 * control and reports intent via `onChange`.
 */
export default function TaskStatusSelect({ task, isSaving, onChange }) {
  return (
    <Select
      aria-label={`Update status for ${task.title}`}
      className="w-32 py-1 text-xs"
      options={TASK_STATUS_OPTIONS}
      value={task.status}
      disabled={isSaving}
      onChange={(event) => onChange(task, event.target.value)}
    />
  );
}
