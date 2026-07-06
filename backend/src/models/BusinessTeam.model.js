import mongoose from 'mongoose';

import { EMAIL_REGEX } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * business_teams -- roster for business-unit members, independent of
 * the cxo_teams leadership hierarchy (no direct reference between the
 * two). emailId is the natural shared identifier if the same person
 * appears in both collections.
 */
const businessTeamSchema = new Schema(
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
    business: {
      type: String,
      required: [true, 'Business unit is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    place: {
      type: String,
      trim: true,
    },
    room: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

businessTeamSchema.plugin(auditableSchemaPlugin, { userRef: 'CxoTeam' });

// Scoped to non-deleted documents (see CxoTeam.model.js for the full
// rationale) so a "replace all data" CSV import can soft-delete the
// existing roster and re-insert the same emails without a DB-level
// duplicate-key conflict.
businessTeamSchema.index(
  { emailId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);

// Common filter combination (e.g. "everyone in Payments in Bangalore")
businessTeamSchema.index({ business: 1, location: 1 });

// Free-text search by name
businessTeamSchema.index({ name: 'text' });

export default mongoose.model('BusinessTeam', businessTeamSchema, 'business_teams');
