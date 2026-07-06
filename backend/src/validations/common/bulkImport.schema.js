import { z } from 'zod';

/**
 * Validates a bulk-import request body: { records: object[], mode? }.
 * Reused by every resource's POST /import route instead of each one
 * declaring its own `z.array(bodySchema)` — that per-record shape is
 * validated later, per row, inside BaseService.bulkCreate (via the
 * resource's own `bodySchema` option), so a single bad row is reported
 * and skipped rather than rejecting the whole request outright before
 * any row is even looked at.
 *
 * `mode`:
 *   - 'append' (default) — insert the new records alongside whatever
 *     already exists.
 *   - 'replace' — soft-delete every existing record for this resource
 *     first, then insert the new set (BaseService.replaceAll).
 */
export const bulkImportSchema = z.object({
  body: z.object({
    records: z.array(z.record(z.string(), z.unknown())).min(1, 'At least one record is required'),
    mode: z.enum(['append', 'replace']).optional().default('append'),
  }),
});
