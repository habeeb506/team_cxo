import { useCallback, useEffect, useMemo, useState } from 'react';

import { getCached, setCached } from '../utils/apiCache.js';

import usePagination from './usePagination.js';

/**
 * The standard hook every list/table page is built on. Combines
 * pagination, filters, search, and sort into one query, fetches it
 * through the given ApiService instance, and briefly caches the
 * result. Every future module's list page uses this exact hook --
 * only the apiService instance (and initial options) change.
 *
 * Usage:
 *   const { data, pagination, isLoading, error, page, filters, search,
 *     setPage, setFilters, setSearch, refetch } = useApiResource(cxoTeamApiService);
 */
export default function useApiResource(
  apiService,
  { initialFilters = {}, initialSort = '-createdAt', pageSize = 20, cacheTtlMs = 15000 } = {},
) {
  // Page/limit state is delegated to usePagination -- the same hook a
  // future client-side-only (non-ApiService) list could use standalone
  // -- instead of re-declaring identical useState calls here.
  const { page, limit, setPage, setLimit } = usePagination({ initialLimit: pageSize });
  const [filters, setFiltersState] = useState(initialFilters);
  const [search, setSearchState] = useState('');
  const [sort, setSort] = useState(initialSort);

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const queryParams = useMemo(
    () => ({ page, limit, sort, search: search || undefined, ...filters }),
    [page, limit, sort, search, filters],
  );

  const cacheKey = useMemo(
    () => `${apiService.resourcePath}?${JSON.stringify(queryParams)}`,
    [apiService, queryParams],
  );

  useEffect(() => {
    let isMounted = true;

    const cached = cacheTtlMs > 0 ? getCached(cacheKey) : null;
    if (cached) {
      setData(cached.data);
      setPagination(cached.pagination);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    apiService
      .getAll(queryParams)
      .then((response) => {
        if (!isMounted) return;
        setData(response.data || []);
        setPagination(response.pagination || null);
        if (cacheTtlMs > 0) {
          setCached(cacheKey, { data: response.data, pagination: response.pagination }, cacheTtlMs);
        }
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
  }, [cacheKey, reloadToken]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  const setFilters = useCallback(
    (next) => {
      setFiltersState(next);
      setPage(1);
    },
    [setPage],
  );

  const setSearch = useCallback(
    (value) => {
      setSearchState(value);
      setPage(1);
    },
    [setPage],
  );

  return {
    data,
    pagination,
    isLoading,
    error,
    page,
    limit,
    sort,
    filters,
    search,
    setPage,
    setLimit,
    setSort,
    setFilters,
    setSearch,
    refetch,
  };
}
