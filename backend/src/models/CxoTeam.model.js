import mongoose from 'mongoose';

import { EMAIL_REGEX, TEAM_MEMBER_STATUS } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * cxo_teams -- the leadership/reporting-hierarchy roster. `lead` and
 * `manager` self-reference this same collection, which is what makes
 * org-chart traversal (direct reports, manager chains) possible
 * without a separate hierarchy table. See ARCHITECTURE.md for the full
 * indexing/relationship rationale.
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
    empIdOld: {
      type: String,
      trim: true,
      // legacy id doesn't exist for every member
    },
    empIdNew: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
    },
    level: {
      // Free-form on purpose -- org level codes (e.g. L1-L6, bands)
      // vary by company and change independently of this schema.
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
    status: {
      type: String,
      enum: TEAM_MEMBER_STATUS,
      default: 'active',
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
