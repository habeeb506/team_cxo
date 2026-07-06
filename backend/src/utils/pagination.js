import { PAGINATION_DEFAULTS } from '../config/constants.js';

/**
 * Parses page/limit/sort query params (already validated by
 * validations/common/pagination.schema.js) into the shape
 * BaseRepository.findMany expects. Centralized so every list endpoint
 * paginates identically.
 */
export function parsePaginationQuery(query = {}) {
  const page = Math.max(Number(query.page) || PAGINATION_DEFAULTS.PAGE, 1);
  const limit = Math.min(
    Math.max(Number(query.limit) || PAGINATION_DEFAULTS.LIMIT, 1),
    PAGINATION_DEFAULTS.MAX_LIMIT,
  );
  const sort = typeof query.sort === 'string' && query.sort.trim() ? query.sort.trim() : '-createdAt';

  return { page, limit, sort };
}
