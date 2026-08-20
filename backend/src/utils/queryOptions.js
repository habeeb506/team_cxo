import { parsePaginationQuery } from './pagination.js';

/**
 * Escapes regex metacharacters so user-supplied search text is treated
 * as a literal substring match rather than evaluated as a pattern.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parses a `"2024,2025"`-style comma-separated query param into a
 * deduped array of integers, dropping anything that doesn't parse.
 * Shared by buildListQueryOptions (below) and
 * services/LeaderboardService.js, which both need the same
 * years/months list parsing for the multi-select Year/Month filter.
 */
export function parseCsvIntList(value) {
  if (typeof value !== 'string' || !value.trim()) return [];
  const numbers = value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((number) => Number.isInteger(number));
  return [...new Set(numbers)];
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
 * - `dateRangeField`, if given, turns the optional multi-select
 *   `?years=&months=` pair on the query string (see
 *   validations/common/yearMonthQuery.schema.js) into a MongoDB `$expr`
 *   filter on that field using the `$year`/`$month` date-expression
 *   operators -- each axis given is AND'd together, so "years=2024,2025"
 *   with "months=1,3" matches Jan+Mar of either year. Either axis alone
 *   (or omitting both -- the UI's "select all") works too. Used by
 *   resources whose Dashboard widgets offer the Year/Month filter
 *   (currently tickets and tasks).
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

  if (dateRangeField) {
    const years = parseCsvIntList(query.years);
    const months = parseCsvIntList(query.months);
    const exprClauses = [];
    if (years.length > 0) exprClauses.push({ $in: [{ $year: `$${dateRangeField}` }, years] });
    if (months.length > 0) exprClauses.push({ $in: [{ $month: `$${dateRangeField}` }, months] });
    if (exprClauses.length > 0) {
      filter.$expr = exprClauses.length > 1 ? { $and: exprClauses } : exprClauses[0];
    }
  }

  return { page, limit, sort, filter };
}
