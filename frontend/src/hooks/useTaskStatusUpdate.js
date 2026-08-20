import { useCallback, useState } from 'react';

import taskApiService from '../api/services/taskApiService.js';
import { invalidateCache } from '../utils/apiCache.js';
import { emitTaskStatusChanged } from '../utils/taskEvents.js';

/**
 * Shared "quick-edit a task's status from the Dashboard" behavior, used
 * by both OpenTasksPanel and IndividualContributionPanel's Tasks tab so
 * neither hand-rolls its own PATCH call + cache invalidation.
 *
 * Goes through the same `PATCH /tasks/:id` (taskApiService, full CRUD --
 * see pages/TasksPage.jsx) the Tasks admin page already uses; there's no
 * separate "quick edit" endpoint. The server, not this hook, is what
 * stamps `completedAt` with the system date/time whenever status becomes
 * 'done' (see backend/src/services/TaskService.js's `update` override) --
 * nothing client-supplied can fake a completion timestamp, since the
 * request body only ever carries `{ status }`.
 *
 * On success this does two things, deliberately separate: (1)
 * `invalidateCache(resourcePath)` (`utils/apiCache.js`) drops the stale
 * cached response so the *next* fetch of this resource returns fresh
 * data, and (2) `emitTaskStatusChanged()` (`utils/taskEvents.js`)
 * notifies every already-mounted widget subscribed via
 * `hooks/useTaskStatusSync.js` to actually go fetch that fresh data now
 * -- regardless of which widget made the edit. Without (2), a widget
 * that didn't trigger the edit would keep showing stale data until its
 * own next mount/refetch; without (1), that refetch would just serve
 * the same stale cached response back. Together they're what makes an
 * edit in Open Tasks show up in Individual Contribution (and vice
 * versa) immediately, with no page reload.
 */
export default function useTaskStatusUpdate(resourcePath) {
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);

  const updateStatus = useCallback(
    async (task, status) => {
      const id = task.id ?? task._id;
      setSavingId(id);
      setError(null);
      try {
        await taskApiService.update(id, { status });
        invalidateCache(resourcePath);
        emitTaskStatusChanged();
      } catch (err) {
        setError(err.message || 'Could not update task status');
      } finally {
        setSavingId(null);
      }
    },
    [resourcePath],
  );

  return { updateStatus, savingId, error };
}
