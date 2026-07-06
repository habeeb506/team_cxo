import { useCallback, useEffect, useState } from 'react';

import { getCached, setCached } from '../utils/apiCache.js';

// In-flight request registry, keyed by cacheKey. Lets two components
// that call useFetch with the same cacheKey at (roughly) the same time
// -- e.g. Header and MachineIdentityBanner both resolving the machine
// identity on the same Dashboard render -- share one network request
// instead of firing a duplicate one before either has resolved (a
// resolved-value TTL cache alone doesn't catch this: both callers would
// still miss the cache simultaneously since neither has written to it
// yet).
const inFlightRequests = new Map();

function dedupedFetch(cacheKey, fetcher) {
  if (!cacheKey) return fetcher();

  if (!inFlightRequests.has(cacheKey)) {
    const promise = fetcher().finally(() => inFlightRequests.delete(cacheKey));
    inFlightRequests.set(cacheKey, promise);
  }
  return inFlightRequests.get(cacheKey);
}

/**
 * Generic async data-fetching hook. Wraps any api/ function (e.g.
 * healthApi.getHealthStatus) with loading/error/data state and a
 * refetch handle, so list/detail pages don't each reimplement this.
 *
 * Pass `cacheKey` (plus `cacheTtlMs`, default 0 = no caching) for data
 * that's expensive or wasteful to re-fetch on every mount -- reuses the
 * same TTL cache as hooks/useApiResource.js (utils/apiCache.js) so the
 * app has exactly one caching mechanism, not two.
 *
 * Usage:
 *   const { data, error, isLoading } = useFetch(() => userApi.getAll(), [page]);
 *   const { data } = useFetch(() => systemApi.getIdentity(), [], { cacheKey: 'system/identity', cacheTtlMs: 300000 });
 */
export default function useFetch(fetcher, deps = [], { cacheKey, cacheTtlMs = 0 } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const run = useCallback(() => {
    let isMounted = true;

    const cached = cacheKey && cacheTtlMs > 0 ? getCached(cacheKey) : null;
    if (cached) {
      setData(cached);
      setError(null);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    dedupedFetch(cacheKey, fetcher)
      .then((result) => {
        if (!isMounted) return;
        setData(result);
        if (cacheKey && cacheTtlMs > 0) setCached(cacheKey, result, cacheTtlMs);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Something went wrong');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { data, error, isLoading, refetch: run };
}
