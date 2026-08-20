import { z } from 'zod';

const yearsList = /^\d{4}(,\d{4})*$/;
const monthsList = /^(0?[1-9]|1[0-2])(,(0?[1-9]|1[0-2]))*$/;

/**
 * Shared query shape for the Dashboard's multi-select Year/Month filter
 * (see components/dashboard/YearMonthFilter.jsx on the frontend):
 * `?years=2024,2025&months=1,3,7`, both optional and independent of
 * each other. Not a standalone schema -- other routes' schemas
 * `.extend()` their own query shape with this (see ticket.routes.js,
 * task.routes.js, leaderboard.routes.js) since which other query params
 * are allowed still varies per resource.
 *
 * Each axis is matched independently (AND'd together when both are
 * given) via MongoDB's `$year`/`$month` date-expression operators --
 * see utils/queryOptions.js's buildListQueryOptions -- so "every March,
 * across any year" and "Jan+Feb across 2024+2025" are both expressible,
 * not just contiguous ranges. Omitting an axis (or the UI's "select
 * all") means "no restriction on that axis".
 */
export const yearMonthQueryShape = {
  years: z
    .string()
    .regex(yearsList, 'years must be a comma-separated list of 4-digit years')
    .optional(),
  months: z
    .string()
    .regex(monthsList, 'months must be a comma-separated list of numbers 1-12')
    .optional(),
};
