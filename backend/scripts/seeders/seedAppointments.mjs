import { Appointment } from '../../src/models/index.js';
import { APPOINTMENT_STATUSES } from '../../src/config/constants.js';

const APPOINTMENTS_PER_USER = 8;

const APPOINTMENT_TITLES = [
  'Quarterly review with client',
  'Onboarding call with new hire',
  'Vendor contract discussion',
  'Product demo for prospect',
  'One-on-one with manager',
  'Budget planning session',
  'Cross-team sync',
  'Customer escalation call',
];

const PEOPLE = [
  'Alex Rivera',
  'Priya Nair',
  'Tom Becker',
  'Lena Fischer',
  'Omar Haddad',
  'Grace Kim',
  'Sam Okafor',
  'Nora Patel',
];

function pick(array, index) {
  return array[index % array.length];
}

/**
 * Seeds `appointments` for each of the seed script's "activity" users
 * (see seedUsers.mjs), so the Dashboard's Individual Contribution
 * "Appointments" tab always has real data to show. Mix of past
 * (completed/cancelled) and upcoming (scheduled) so both empty-state
 * and populated views are exercised.
 */
export async function seedAppointments(activityUsers) {
  const records = [];
  const now = Date.now();

  activityUsers.forEach((user, userIndex) => {
    for (let i = 0; i < APPOINTMENTS_PER_USER; i++) {
      const offsetDays = i * 5 - APPOINTMENTS_PER_USER + (userIndex % 3);
      const scheduledAt = new Date(now + offsetDays * 24 * 60 * 60 * 1000);
      const status = offsetDays < 0 ? pick(['completed', 'cancelled'], i + userIndex) : 'scheduled';

      records.push({
        title: pick(APPOINTMENT_TITLES, i + userIndex),
        withPerson: pick(PEOPLE, i + userIndex * 2),
        scheduledAt,
        status: APPOINTMENT_STATUSES.includes(status) ? status : 'scheduled',
        notes: 'Seed data for local development and testing of the Individual Contribution panel.',
        assignedTo: user._id,
      });
    }
  });

  return Appointment.insertMany(records);
}
