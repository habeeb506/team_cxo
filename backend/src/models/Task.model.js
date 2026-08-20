import mongoose from 'mongoose';

import { PRIORITY_LEVELS, TASK_STATUSES } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * tasks -- individual work items, shown in the Dashboard's Individual
 * Contribution panel (scoped to the current user via `assignedTo`) and
 * rolled up into LeaderboardEntry.tasksCompleted snapshots. See
 * Ticket.model.js for why this is a separate collection from the
 * leaderboard snapshot rather than the source of a live computation.
 */
const taskSchema = new Schema(
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
      enum: { values: TASK_STATUSES, message: '{VALUE} is not a supported task status' },
      default: 'todo',
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
    dueDate: {
      type: Date,
      default: null,
    },
    // Server-set only -- never accepted directly from client input (see
    // TaskService.update's override, which stamps this with the system
    // date/time whenever `status` transitions to 'done', and clears it
    // otherwise). Exists so "when was this actually finished" is a fact
    // the server owns, the same trust boundary this app already applies
    // to `assignedTo` on the `/mine` endpoints.
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

taskSchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

// Primary read pattern: "this user's tasks, most recent first".
taskSchema.index({ assignedTo: 1, createdAt: -1 });
taskSchema.index({ status: 1 });

export default mongoose.model('Task', taskSchema, 'tasks');
