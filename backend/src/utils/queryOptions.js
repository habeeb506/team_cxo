import { parsePaginationQuery } from './pagination.js';

/**
 * Escapes regex metacharacters so user-supplied search text is treated
 * as a literal substring match rather than evaluated as a pattern.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds { page, limit, sort, filter } for a list endpoint from raw
 * query params, given a resource's allowed filter fields and
 * searchable fields. Every resource's GET / handler goes through this
 * (via controllers/baseController.js) instead of hand-rolling filter
 * logic per route.
 *
 * - Only fields named in `allowedFilters` are read from the query
 *   string and matched exactly — anything else the client sends is
 *   ignored, so clients can't filter on arbitrary/unindexed fields.
 * - `search` does a case-insensitive substring match across
 *   `searchableFields` using $or.
 */
export function buildListQueryOptions(query = {}, { allowedFilters = [], searchableFields = [] } = {}) {
  const { page, limit, sort } = parsePaginationQuery(query);

  const filter = {};
  for (const field of allowedFilters) {
    const value = query[field];
    if (value !== undefined && value !== '') {
      filter[field] = value;
    }
  }

  if (searchableFields.length > 0 && typeof query.search === 'string' && query.search.trim()) {
    const regex = new RegExp(escapeRegExp(query.search.trim()), 'i');
    filter.$or = searchableFields.map((field) => ({ [field]: regex }));
  }

  return { page, limit, sort, filter };
}
