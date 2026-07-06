import mongoose from 'mongoose';

import { PRIORITY_LEVELS, TICKET_STATUSES } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * tickets -- individual support/work tickets, shown in the Dashboard's
 * Individual Contribution panel (scoped to the current user via
 * `assignedTo`) and rolled up into LeaderboardEntry.ticketsResolved
 * snapshots. A person's ticket history and their leaderboard score are
 * deliberately two different collections (a raw activity log vs. a
 * periodic scored snapshot) rather than computing the leaderboard from
 * this collection on every read -- see LeaderboardEntry.model.js.
 */
const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: { values: TICKET_STATUSES, message: '{VALUE} is not a supported ticket status' },
      default: 'open',
    },
    priority: {
      type: String,
      required: true,
      enum: { values: PRIORITY_LEVELS, message: '{VALUE} is not a supported priority' },
      default: 'medium',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'assignedTo is required'],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

ticketSchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

// Primary read pattern: "this user's tickets, most recent first".
ticketSchema.index({ assignedTo: 1, createdAt: -1 });
ticketSchema.index({ status: 1 });

export default mongoose.model('Ticket', ticketSchema, 'tickets');
