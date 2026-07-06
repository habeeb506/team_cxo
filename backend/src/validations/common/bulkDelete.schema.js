import { z } from 'zod';

import { objectIdSchema } from './objectId.schema.js';

/**
 * Validates a bulk-delete request body: { ids: string[] }. Reused by
 * every resource's POST /bulk-delete route.
 */
export const bulkDeleteSchema = z.object({
  body: z.object({
    ids: z.array(objectIdSchema).min(1, 'At least one id is required'),
  }),
});
