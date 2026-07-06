/**
 * Minimal in-memory TTL cache. This is deliberately small — it's a
 * seam to avoid duplicate network calls for a few seconds, not a full
 * caching solution. If the app later adopts a library like React Query
 * or SWR, only hooks/useApiResource.js's internals change; its
 * external hook API (data, isLoading, error, refetch...) stays the
 * same, so nothing that consumes it needs to change.
 */
const store = new Map();

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Drops every cache entry whose key starts with `prefix` — call after
 * a mutation so a resource's list views don't serve stale cached data. */
export function invalidateCache(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export function clearCache() {
  store.clear();
}
