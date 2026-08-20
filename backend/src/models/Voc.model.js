import mongoose from 'mongoose';

import { VOC_CATEGORIES, VOC_RATING_RANGE } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * vocs -- Voice of Customer feedback attributed to the person who
 * handled it, shown as one of the Dashboard's Individual Contribution
 * tabs (scoped via `assignedTo`, same pattern as Ticket.model.js). Also
 * rolled up into LeaderboardEntry.vocCount snapshots -- see
 * Ticket.model.js's docblock for why that's a separate, periodic
 * snapshot rather than a live count of this collection. Read-only for
 * now (see backend/src/routes/v1/voc.routes.js).
 */
const vocSchema = new Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: 150,
    },
    feedback: {
      type: String,
      required: [true, 'Feedback is required'],
      trim: true,
      maxlength: 2000,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: VOC_RATING_RANGE.MIN,
      max: VOC_RATING_RANGE.MAX,
    },
    category: {
      type: String,
      enum: { values: VOC_CATEGORIES, message: '{VALUE} is not a supported VOC category' },
      default: 'praise',
    },
    receivedAt: {
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

vocSchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

// Primary read pattern: "this user's VOC feedback, most recent first".
vocSchema.index({ assignedTo: 1, receivedAt: -1 });
vocSchema.index({ category: 1 });

export default mongoose.model('Voc', vocSchema, 'vocs');
