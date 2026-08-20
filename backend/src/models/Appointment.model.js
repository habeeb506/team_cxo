import mongoose from 'mongoose';

import { APPOINTMENT_STATUSES } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * appointments -- a person's scheduled meetings/appointments, shown as
 * one of the Dashboard's Individual Contribution tabs (scoped to the
 * current user via `assignedTo`, same pattern as Ticket.model.js/
 * Task.model.js). Read-only for now (see
 * backend/src/routes/v1/appointment.routes.js) -- there's no UI to
 * create/edit one yet, only to view.
 */
const appointmentSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    withPerson: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'scheduledAt is required'],
    },
    status: {
      type: String,
      required: true,
      enum: { values: APPOINTMENT_STATUSES, message: '{VALUE} is not a supported appointment status' },
      default: 'scheduled',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'assignedTo is required'],
    },
  },
  { timestamps: true },
);

appointmentSchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

// Primary read pattern: "this user's appointments, soonest first".
appointmentSchema.index({ assignedTo: 1, scheduledAt: 1 });
appointmentSchema.index({ status: 1 });

export default mongoose.model('Appointment', appointmentSchema, 'appointments');
