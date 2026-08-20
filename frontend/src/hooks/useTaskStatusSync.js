import { useEffect } from 'react';

import { onTaskStatusChanged } from '../utils/taskEvents.js';

/**
 * Subscribes `refetch` to the shared "a task's status changed
 * somewhere" event (see utils/taskEvents.js and
 * hooks/useTaskStatusUpdate.js), so this widget's own task list stays
 * live-synced with edits made from a *different* widget -- e.g. marking
 * a task 'done' from Open Tasks immediately moves it into Individual
 * Contribution's Tasks tab, with no page refresh, and vice versa.
 *
 * Every task-status-aware widget calls this once with its own
 * `refetch` (from `useApiResource`), regardless of whether it's the one
 * making the edit -- the event fires identically either way, so there's
 * no special-casing "did I cause this or did someone else."
 */
export default function useTaskStatusSync(refetch) {
  useEffect(() => onTaskStatusChanged(refetch), [refetch]);
}
