import mongoose from 'mongoose';

import { EMAIL_REGEX, USER_ROLES } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * users -- app accounts. Real authentication doesn't exist yet (see
 * ARCHITECTURE.md's "Suggested improvements" list); until then, these
 * are dummy/seeded accounts and `isDemoAccount` marks the subset (~20
 * of however many are seeded) offered in the frontend's mock
 * "logged in as" switcher (context/CurrentUserContext.jsx). The
 * remaining seeded users exist purely as leaderboard/comparison
 * participants (see LeaderboardEntry.model.js) -- there's no second
 * "person" collection duplicating this one.
 *
 * `role` drives which parts of the app a user sees once role-based
 * visibility rules exist beyond what's built today; every dashboard
 * section currently shown is visible to every role.
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
    // Offered in the frontend's mock login switcher. Every other seeded
    // user still participates in the leaderboard/comparison views, just
    // isn't selectable as "you" from the switcher.
    isDemoAccount: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);
userSchema.index({ isDemoAccount: 1 });
userSchema.index({ name: 'text' });

export default mongoose.model('User', userSchema, 'users');
