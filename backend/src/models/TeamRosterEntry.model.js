import mongoose from 'mongoose';

import { TEAM_MEMBER_SUPPORT_TYPES } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * team_roster_entries -- one row per team member per calendar day,
 * populated by the monthly roster upload (see TeamRosterService.importRoster).
 * This is the historical record the roster stats bar's day/week/month
 * counts are computed from; `CxoTeam.support`/`CxoTeam.shift` only ever
 * hold each person's *latest* entry (kept in sync by
 * TeamRosterService.syncCurrentSupport), so the Team Members table can
 * show "today's" support value without a join on every list request.
 *
 * `date` is always normalized to UTC midnight (see utils/date.js's
 * toUtcDateOnly) so it represents a whole day, not a timestamp -- the
 * same pattern LeaderboardEntry.snapshotDate uses, for the same reason
 * (exact equality/range queries instead of time-of-day drift).
 */
const teamRosterEntrySchema = new Schema(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: 'CxoTeam',
      required: [true, 'Member is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    support: {
      type: String,
      enum: TEAM_MEMBER_SUPPORT_TYPES,
      required: [true, 'Support is required'],
    },
    shift: {
      type: String,
      trim: true,
    },
    // Free-text time range this day's `support` assignment applies to
    // (e.g. "9:00 AM - 1:00 PM") -- see CxoTeam.model.js's `timeSlot` field.
    timeSlot: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

teamRosterEntrySchema.plugin(auditableSchemaPlugin, { userRef: 'CxoTeam' });

// One entry per member per day -- re-uploading a corrected roster
// upserts onto this same (member, date) pair (see
// TeamRosterEntryRepository.upsertEntry) rather than creating a
// duplicate. Partial (scoped to non-deleted documents), same
// soft-delete-safe pattern every other unique index in this app uses.
teamRosterEntrySchema.index(
  { member: 1, date: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);

// Primary stats read pattern: "every entry in this date range" (see
// TeamRosterEntryRepository.getDistinctMembersBySupport).
teamRosterEntrySchema.index({ date: 1 });

export default mongoose.model('TeamRosterEntry', teamRosterEntrySchema, 'team_roster_entries');
