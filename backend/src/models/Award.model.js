import mongoose from 'mongoose';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * awards -- formal recognitions/awards given to a person, shown as one
 * of the Dashboard's Individual Contribution tabs (scoped via
 * `assignedTo`, the recipient -- same pattern as Ticket.model.js). Also
 * rolled up into LeaderboardEntry.recognitions snapshots -- see
 * Ticket.model.js's docblock for why that's a separate, periodic
 * snapshot rather than a live count of this collection. Read-only for
 * now (see backend/src/routes/v1/award.routes.js).
 */
const awardSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    awardedAt: {
      type: Date,
      default: Date.now,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'assignedTo is required'],
    },
  },
  { timestamps: true },
);

awardSchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

// Primary read pattern: "this user's awards, most recent first".
awardSchema.index({ assignedTo: 1, awardedAt: -1 });

export default mongoose.model('Award', awardSchema, 'awards');
