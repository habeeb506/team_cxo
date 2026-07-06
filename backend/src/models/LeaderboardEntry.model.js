import mongoose from 'mongoose';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * leaderboard_entries -- one scored snapshot per user per date, powering
 * the Dashboard's Leaderboard panel. Deliberately a periodic snapshot
 * rather than a live aggregation over tickets/tasks/etc. on every
 * request: the panel needs a stable, comparable "as of this date" view
 * (with a date picker to look at earlier snapshots), which a snapshot
 * table gives for free and a live query would have to reconstruct with
 * a much more expensive point-in-time aggregation across several
 * collections.
 *
 * `overallScore` is a pre-computed weighted total (seed script shows the
 * weighting used); it isn't derived from the other fields at read time
 * so the ranking logic (services/LeaderboardService.js sorts by this
 * field) stays a single, cheap sort over one bounded collection instead
 * of a formula duplicated between the seed data and every reader.
 *
 * Rank is intentionally NOT stored here -- see LeaderboardService.js.
 * Storing a rank alongside the score risks the two silently drifting
 * apart; computing it at read time from overallScore never can.
 */
const leaderboardEntrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
    },
    // Normalized to midnight UTC for the day this snapshot represents,
    // so equality queries (?date=YYYY-MM-DD) are exact -- see
    // repositories/LeaderboardEntryRepository.js.
    snapshotDate: {
      type: Date,
      required: [true, 'snapshotDate is required'],
    },
    tasksCompleted: { type: Number, required: true, min: 0, default: 0 },
    ticketsResolved: { type: Number, required: true, min: 0, default: 0 },
    vocCount: { type: Number, required: true, min: 0, default: 0 },
    shoutOuts: { type: Number, required: true, min: 0, default: 0 },
    recognitions: { type: Number, required: true, min: 0, default: 0 },
    overallScore: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);

leaderboardEntrySchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

// One snapshot per user per date; also the primary read pattern ("every
// entry for date X"). Scoped to non-deleted documents, consistent with
// every other partial unique index in this app.
leaderboardEntrySchema.index(
  { user: 1, snapshotDate: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);
leaderboardEntrySchema.index({ snapshotDate: -1 });

export default mongoose.model('LeaderboardEntry', leaderboardEntrySchema, 'leaderboard_entries');
