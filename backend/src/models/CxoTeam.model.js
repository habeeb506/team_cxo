import mongoose from 'mongoose';

import { EMAIL_REGEX, TEAM_MEMBER_SUPPORT_TYPES } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * cxo_teams -- the leadership/reporting-hierarchy roster. `lead` and
 * `manager` self-reference this same collection, which is what makes
 * org-chart traversal (direct reports, manager chains) possible
 * without a separate hierarchy table. See ARCHITECTURE.md for the full
 * indexing/relationship rationale.
 *
 * By request, this also carries a career/development profile block
 * (careerLevel, priorExperience, lastPromotionDate, backupTeamMember,
 * coach, primaryPortfolio/secondaryPortfolio/otherPortfolio,
 * learningHours, businessChemistry, certificationsPlanned, ceBaseline,
 * mobile) alongside the pre-existing roster/hierarchy fields -- added on
 * top of the schema, not a replacement for anything already here.
 * `firmExperience`, `overallExperience`, and `timeInRole` are
 * deliberately **not** stored fields -- they're derived from
 * `joiningDate`/`priorExperience`/`lastPromotionDate` and would go stale
 * every single day if persisted, so they're computed fresh on every
 * read instead (see services/CxoTeamService.js's attachExperienceFields
 * and utils/experience.js), the same pattern TaskService uses for
 * `completionTimeliness`.
 */
const cxoTeamSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 150,
    },
    emailId: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Invalid email format'],
    },
    // Numeric, by request -- previously a free-text string (e.g.
    // "LEGACY-1005") since not every member has a legacy id at all
    // (still true; still not `required`).
    empIdOld: {
      type: Number,
      // legacy id doesn't exist for every member
    },
    // Numeric, by request -- previously a free-text string (e.g.
    // "EMP2003").
    empIdNew: {
      type: Number,
      required: [true, 'Employee ID is required'],
    },
    level: {
      // Free-form on purpose -- org level codes (e.g. L1-L6, bands)
      // vary by company and change independently of this schema.
      type: String,
      trim: true,
    },
    // Distinct from `level` above (which is an org-hierarchy code like
    // "L1"-"L4") -- a separate, free-text career/competency band (e.g.
    // "Senior Manager", "Director"), added alongside the existing
    // fields on this document rather than replacing `level`.
    careerLevel: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      maxlength: 150,
    },
    location: {
      type: String,
      trim: true,
    },
    place: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      trim: true,
      default: null,
    },
    lead: {
      type: Schema.Types.ObjectId,
      ref: 'CxoTeam',
      default: null,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'CxoTeam',
      default: null,
    },
    group: {
      type: String,
      trim: true,
    },
    // Years of relevant experience *before* joining this firm --
    // combined with tenure here (see `joiningDate` below) to compute
    // `overallExperience` at read time (see services/CxoTeamService.js's
    // attachExperienceFields) rather than storing a value that would
    // silently go stale the moment a day passes.
    priorExperience: {
      type: Number,
      min: 0,
      default: null,
    },
    // The date of this person's most recent promotion, if any -- paired
    // with `timeInRole` (computed from this at read time; falls back to
    // `joiningDate` for someone who's never been promoted, so "time in
    // role" always means "time since the current role started").
    lastPromotionDate: {
      type: Date,
      default: null,
    },
    backupTeamMember: {
      type: String,
      trim: true,
    },
    coach: {
      type: String,
      trim: true,
    },
    primaryPortfolio: {
      type: String,
      trim: true,
    },
    secondaryPortfolio: {
      type: String,
      trim: true,
    },
    otherPortfolio: {
      type: String,
      trim: true,
    },
    learningHours: {
      type: Number,
      min: 0,
      default: null,
    },
    businessChemistry: {
      type: String,
      trim: true,
    },
    certificationsPlanned: {
      type: String,
      trim: true,
    },
    ceBaseline: {
      type: String,
      trim: true,
    },
    // Free-form on purpose, like every other contact/identity string on
    // this document -- phone formats vary too widely (country codes,
    // extensions) to be worth a fixed pattern.
    mobile: {
      type: String,
      trim: true,
    },
    // Free-form on purpose, like `level`/`group` -- shift schedules
    // (e.g. "9:00 AM to 6:00 PM") vary by team and aren't worth a fixed
    // enum. This is the person's regular/current shift, kept in sync
    // with their most recent team_roster_entries row -- see
    // TeamRosterService.syncCurrentSupport.
    shift: {
      type: String,
      trim: true,
    },
    // Daily roster-status value (see TEAM_MEMBER_SUPPORT_TYPES in
    // config/constants.js: available/training/reconciliation/mfa/dlaunch/
    // pto/epto/other) -- kept in sync with this person's most recent
    // team_roster_entries row by TeamRosterService.syncCurrentSupport
    // every time a roster is uploaded. Defaults to 'available', the
    // everyday/nothing-special-to-report state. Not directly editable as
    // a day-to-day fact the way name/designation are, though the Team
    // Members edit form still allows a manual override for convenience.
    support: {
      type: String,
      enum: TEAM_MEMBER_SUPPORT_TYPES,
      default: 'available',
    },
    // Free-text time range the current `support` assignment applies to
    // (e.g. "9:00 AM - 1:00 PM"), the same free-form pattern `shift`
    // uses -- kept in sync with this person's most recent
    // team_roster_entries row by TeamRosterService.syncCurrentSupport,
    // same as support/shift.
    timeSlot: {
      type: String,
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

cxoTeamSchema.plugin(auditableSchemaPlugin, { userRef: 'CxoTeam' });

// Uniqueness is scoped to non-deleted documents (partial index) rather
// than declared inline via `unique: true` -- a plain unique index would
// still enforce uniqueness against soft-deleted rows at the MongoDB
// level, which would make "replace all data" imports (soft-delete the
// existing roster, then insert a fresh one with the same emails/ids)
// fail with duplicate-key errors even though the app-level uniqueness
// check (BaseService.assertUnique) already excludes deleted rows.
cxoTeamSchema.index(
  { emailId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);
cxoTeamSchema.index(
  { empIdNew: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);
cxoTeamSchema.index(
  { empIdOld: 1 },
  {
    unique: true,
    // also replaces the old `sparse: true` -- only enforced where the
    // (optional) legacy id is actually present.
    partialFilterExpression: { isDeleted: { $ne: true }, empIdOld: { $exists: true } },
  },
);

// Hierarchy lookups: "direct reports of X", "everyone reporting to Y"
cxoTeamSchema.index({ lead: 1 });
cxoTeamSchema.index({ manager: 1 });

// Common dashboard/report filter combination (e.g. Team Hierarchy by group+level)
cxoTeamSchema.index({ group: 1, level: 1 });

// Free-text search across name/designation
cxoTeamSchema.index({ name: 'text', designation: 'text' });

export default mongoose.model('CxoTeam', cxoTeamSchema, 'cxo_teams');
