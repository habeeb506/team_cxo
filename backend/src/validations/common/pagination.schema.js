import { z } from 'zod';

import { PAGINATION_DEFAULTS } from '../../config/constants.js';

/**
 * Validates list-endpoint query params. Reused by every resource's
 * GET / (list) route. `limit` is capped here (not just clamped later in
 * utils/pagination.js) so a client sending an out-of-range value gets a
 * clear 400 explaining why, instead of a silent server-side clamp that
 * looks like a bug from the caller's side.
 */
export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(PAGINATION_DEFAULTS.MAX_LIMIT).optional(),
    sort: z.string().optional(),
  }),
});
