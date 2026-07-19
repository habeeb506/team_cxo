/**
 * Mirrors backend/src/config/constants.js TASK_STATUSES/PRIORITY_LEVELS.
 * Frontend and backend are separate packages, so this stays in sync
 * manually — if either backend enum changes, update the matching list
 * here too.
 */
export const TASK_STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export const TASK_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];
