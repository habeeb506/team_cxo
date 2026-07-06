import { z } from 'zod';

/**
 * Bare Mongo ObjectId validator, reused both as a route param check
 * (objectIdParamSchema below) and inline inside other resources'
 * body schemas for reference fields (e.g. cxo_teams.lead, manager).
 */
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id format');

/**
 * Validates a Mongo ObjectId route param. Reused by every feature's
 * :id routes (GET/PATCH/DELETE by id) instead of each one rewriting
 * the same regex.
 */
export const objectIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
