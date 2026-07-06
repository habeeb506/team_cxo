import { useMemo, useState } from 'react';

/**
 * Generic pagination state for any list page backed by DataTable +
 * baseApiService. Keeps page/limit state and exposes the query object
 * to pass straight into an api call.
 */
export default function usePagination({ initialPage = 1, initialLimit = 20 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const query = useMemo(() => ({ page, limit }), [page, limit]);

  const nextPage = () => setPage((current) => current + 1);
  const prevPage = () => setPage((current) => Math.max(1, current - 1));
  const reset = () => setPage(initialPage);

  return { page, limit, setPage, setLimit, nextPage, prevPage, reset, query };
}
