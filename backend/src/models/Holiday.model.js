import mongoose from 'mongoose';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * holidays -- the organization's yearly holiday calendar. Used, together
 * with Saturday/Sunday, to exclude non-working days when computing how
 * late a completed task was against its due date -- see
 * utils/businessTime.js's `calculateBusinessDelayMs` and
 * TaskService.js's `attachCompletionTimeliness`. Read-only for now (see
 * routes/v1/holiday.routes.js) -- there's no admin UI to create/edit one
 * yet, only backend/scripts/seeders/seedHolidays.mjs. Not scoped to a
 * user (no `assignedTo`/`/mine`) -- a holiday calendar applies to
 * everyone equally, unlike tickets/tasks/etc.
 */
const holidaySchema = new Schema(
  {
    occasion: {
      type: String,
      required: [true, 'Occasion is required'],
      trim: true,
      maxlength: 200,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    // Derived from `date` (see the pre-validate hook below) rather than
    // trusted as independent input -- storing it directly is purely so
    // seed data / API responses can show "Day" as its own column
    // without every reader recomputing `date.getDay()` itself, without
    // risking the two ever disagreeing with each other.
    day: {
      type: String,
      enum: { values: DAY_NAMES, message: '{VALUE} is not a valid day name' },
    },
  },
  { timestamps: true },
);

holidaySchema.pre('validate', function setDayFromDate(next) {
  if (this.date) {
    this.day = DAY_NAMES[new Date(this.date).getDay()];
  }
  next();
});

holidaySchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

// Primary read pattern: "every holiday, chronological" -- also the
// natural index for "is this calendar date a holiday" lookups.
holidaySchema.index({ date: 1 });

export default mongoose.model('Holiday', holidaySchema, 'holidays');
