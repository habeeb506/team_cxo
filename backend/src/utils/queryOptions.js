import { parsePaginationQuery } from './pagination.js';
import { getUtcMonthRange } from './date.js';

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
 * - `dateRangeField`, if given, turns an optional `?year=&month=` pair
 *   on the query string into a `{ $gte, $lt }` range filter on that
 *   field (month is optional -- year alone matches the whole year).
 *   Used by resources whose Dashboard widgets offer a Year/Month filter
 *   (currently tickets and tasks; see getUtcMonthRange in utils/date.js).
 */
export function buildListQueryOptions(
  query = {},
  { allowedFilters = [], searchableFields = [], dateRangeField } = {},
) {
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

  if (dateRangeField && query.year !== undefined && query.year !== '') {
    const month = query.month !== undefined && query.month !== '' ? Number(query.month) : undefined;
    const { start, end } = getUtcMonthRange(query.year, month);
    filter[dateRangeField] = { $gte: start, $lt: end };
  }

  return { page, limit, sort, filter };
}
