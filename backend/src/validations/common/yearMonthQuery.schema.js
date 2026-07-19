import { z } from 'zod';

/**
 * Shared query shape for an optional `?year=YYYY&month=M` dashboard
 * filter. Not a standalone schema -- other routes' schemas `.extend()`
 * their own query shape with this (see ticket.routes.js, task.routes.js,
 * leaderboard.routes.js) since which other query params are allowed
 * still varies per resource. `month` alone without `year` is accepted
 * here but ignored by utils/queryOptions.js's buildListQueryOptions
 * (year is required to build a range).
 */
export const yearMonthQueryShape = {
  year: z
    .string()
    .regex(/^\d{4}$/, 'year must be a 4-digit number')
    .optional(),
  month: z
    .string()
    .regex(/^(0?[1-9]|1[0-2])$/, 'month must be between 1 and 12')
    .optional(),
};
