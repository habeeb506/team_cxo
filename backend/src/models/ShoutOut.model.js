import mongoose from 'mongoose';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * shout_outs -- peer recognition messages given to a person, shown as
 * one of the Dashboard's Individual Contribution tabs (scoped via
 * `assignedTo`, the recipient -- same pattern as Ticket.model.js). Also
 * rolled up into LeaderboardEntry.shoutOuts snapshots -- see
 * Ticket.model.js's docblock for why that's a separate, periodic
 * snapshot rather than a live count of this collection. Read-only for
 * now (see backend/src/routes/v1/shoutOut.routes.js).
 */
const shoutOutSchema = new Schema(
  {
    fromName: {
      type: String,
      required: [true, 'From name is required'],
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 1000,
    },
    givenAt: {
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

shoutOutSchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

// Primary read pattern: "this user's shout-outs, most recent first".
shoutOutSchema.index({ assignedTo: 1, givenAt: -1 });

export default mongoose.model('ShoutOut', shoutOutSchema, 'shout_outs');
