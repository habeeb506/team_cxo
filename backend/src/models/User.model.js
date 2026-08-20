import mongoose from 'mongoose';

import { EMAIL_REGEX, USER_ROLES } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * users -- app accounts. Every seeded user can log in for real via
 * email OTP (see routes/v1/auth.routes.js, services/AuthService.js) --
 * there's no password, and no separate "demo account" subset anymore
 * (removed along with the frontend's old mock "logged in as" switcher).
 * Every seeded user also doubles as a leaderboard/comparison
 * participant (see LeaderboardEntry.model.js) -- there's no second
 * "person" collection duplicating this one.
 *
 * `role` drives which parts of the app a user sees once role-based
 * visibility rules exist beyond what's built today; every dashboard
 * section currently shown is visible to every authenticated role.
 * `lastLoginAt` is set on each successful OTP verification, for basic
 * account-activity auditing.
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 150,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Invalid email format'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: { values: USER_ROLES, message: '{VALUE} is not a supported role' },
      default: 'employee',
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    // Set on each successful email-OTP verification (see
    // services/AuthService.js) -- null until a user has ever logged in.
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // Device-lock identity: the OS username this account is allowed to
    // sign in as (see utils/machineIdentity.js, AuthService.verifyOtp,
    // which requires it to match the backend process's OS username,
    // case-insensitively, on every login -- not optional). Auto-derived
    // from `email`'s local part (everything before '@') by the
    // pre-validate hook below whenever it isn't explicitly provided, so
    // every account gets a sensible default with no manual setup --
    // `jane.doe@sample.com` gets alias `jane.doe`. Still a real,
    // independently settable field (not purely computed) for the cases
    // where someone's actual OS username doesn't happen to match their
    // email prefix -- override it with
    // `npm run set-alias --prefix backend -- <email> <osUsername>`
    // (backend/scripts/setUserAlias.mjs). See
    // utils/machineIdentity.js's docblock for why this only makes sense
    // while the app is run locally (backend + browser on the same
    // machine), not once it's hosted somewhere shared.
    alias: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

// Derives `alias` from `email`'s local part when it isn't already set
// explicitly -- see the field's docblock above. Runs on every validate
// (create, and any update that touches `email`/`alias` via a
// document-style save), the same "computed unless overridden" shape
// Holiday.model.js's `day`-from-`date` hook uses, except that one never
// accepts an override (a weekday can't legitimately differ from its
// date) where this one can (an OS username can legitimately differ
// from an email's local part).
userSchema.pre('validate', function deriveAliasFromEmail(next) {
  if (!this.alias && this.email) {
    this.alias = this.email.split('@')[0].trim().toLowerCase();
  }
  next();
});

userSchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);
userSchema.index({ name: 'text' });

export default mongoose.model('User', userSchema, 'users');
