import { useCallback, useEffect, useState } from 'react';

/**
 * Accumulating-pagination counterpart to useApiResource.js. Where
 * useApiResource replaces its data on every page change (classic
 * paged tables), this hook appends each page's results to what's
 * already loaded -- the shape a lazy-loading/infinite-scroll panel
 * needs (currently the Dashboard's News Bulletin panel; reusable by
 * any future activity feed/notification list).
 *
 * Usage:
 *   const { items, isLoading, isLoadingMore, hasMore, loadMore, error } =
 *     useInfiniteList(newsBulletinApiService, { limit: 5, params: { sort: '-publishedAt' } });
 */
export default function useInfiniteList(apiService, { limit = 10, params = {} } = {}) {
  const paramsKey = JSON.stringify(params);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiService
      .getAll({ ...JSON.parse(paramsKey), page: 1, limit })
      .then((response) => {
        if (!isMounted) return;
        setItems(response.data || []);
        setPagination(response.pagination || null);
        setPage(1);
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
  }, [apiService, paramsKey, limit]);

  const hasMore = pagination ? page < pagination.totalPages : false;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);

    apiService
      .getAll({ ...JSON.parse(paramsKey), page: nextPage, limit })
      .then((response) => {
        setItems((current) => [...current, ...(response.data || [])]);
        setPagination(response.pagination || null);
        setPage(nextPage);
      })
      .catch((err) => setError(err.message || 'Something went wrong'))
      .finally(() => setIsLoadingMore(false));
  }, [apiService, paramsKey, limit, page, hasMore, isLoadingMore]);

  return { items, isLoading, isLoadingMore, hasMore, loadMore, error };
}
