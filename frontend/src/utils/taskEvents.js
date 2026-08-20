/**
 * Minimal in-memory pub-sub for "a task's status changed somewhere on
 * this page." Open Tasks and Individual Contribution's Tasks tab are
 * two independent widgets that both read and can quick-edit the same
 * `tasks` data (see hooks/useTaskStatusUpdate.js) -- without this, an
 * edit made in one widget would only refresh itself; the other would
 * keep showing stale data until the page was reloaded. Every
 * tasks-displaying widget subscribes via hooks/useTaskStatusSync.js;
 * `useTaskStatusUpdate` emits once per successful status change,
 * regardless of which widget made the edit.
 *
 * Deliberately not the same thing as `utils/apiCache.js` -- that
 * invalidates *cached response data*; this notifies *already-mounted
 * components* to refetch. Both are needed: without the cache
 * invalidation, a refetch would just serve the same stale cached page.
 */
const listeners = new Set();

/** Notifies every subscriber that a task's status changed. Takes no
 * payload -- subscribers just refetch their own list. */
export function emitTaskStatusChanged() {
  listeners.forEach((listener) => listener());
}

/** Subscribes `listener`; returns an unsubscribe function for cleanup
 * (e.g. from a `useEffect` return). */
export function onTaskStatusChanged(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
