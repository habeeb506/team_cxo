import { z } from 'zod';

/**
 * Validates an optional `?date=YYYY-MM-DD` query param. Reusable by any
 * future endpoint that reads a point-in-time snapshot (currently just
 * GET /leaderboard/entries) -- when absent, the service falls back to
 * the latest available snapshot.
 */
export const dateQuerySchema = z.object({
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format')
      .optional(),
  }),
});
