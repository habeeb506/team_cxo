import { z } from 'zod';

import { TEAM_ROSTER_STATS_PERIODS } from '../config/constants.js';

/**
 * POST /team-roster/import body: `{ records: object[] }`, one row per
 * person per support-assignment day. Deliberately not the shared
 * `bulkImportSchema` (no `mode` -- roster rows always upsert by
 * (member, date), there's no "replace all" concept here) and each
 * record's exact shape (email/date/support/shift/timeSlot) is checked
 * per-row inside TeamRosterService.importRoster, the same "don't reject
 * the whole file over one bad row" reasoning every other CSV import in
 * this app follows.
 */
export const teamRosterImportSchema = z.object({
  body: z.object({
    records: z.array(z.record(z.string(), z.unknown())).min(1, 'At least one record is required'),
  }),
});

/** GET /team-roster/stats query: optional `period` (default 'day') + `date` (default today). */
export const teamRosterStatsQuerySchema = z.object({
  query: z.object({
    period: z.enum(TEAM_ROSTER_STATS_PERIODS).optional(),
    date: z.string().optional(),
  }),
});

/**
 * GET /team-roster/schedule query: optional `date` (default today) --
 * anchors the Monday-Sunday week the Shifts-style schedule grid shows
 * (see TeamRosterService.getWeeklySchedule). No `period` here, unlike
 * the stats query above -- the grid is always a week view.
 */
export const teamRosterScheduleQuerySchema = z.object({
  query: z.object({
    date: z.string().optional(),
  }),
});
