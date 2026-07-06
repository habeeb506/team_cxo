import { Task, Ticket } from '../../src/models/index.js';
import { TASK_STATUSES, TICKET_STATUSES, PRIORITY_LEVELS } from '../../src/config/constants.js';

const TICKETS_PER_USER = 20;
const TASKS_PER_USER = 10;

const TICKET_SUBJECTS = [
  'Unable to reset password from login page',
  'Dashboard widget not loading for one user',
  'Export button times out on large reports',
  'Incorrect total shown on invoice summary',
  'Request to add a new field to the intake form',
  'Slow page load on the reports tab',
  'Notification emails arriving twice',
  'Permission error when opening shared folder',
  'Broken link in the onboarding email',
  'Mobile layout overlapping on small screens',
  'Search returns no results for valid query',
  'Duplicate entries appearing after CSV import',
  'Timezone displayed incorrectly in activity log',
  'File upload fails for files over 10MB',
  'Session expiring too quickly during data entry',
  'Chart legend cut off on narrow screens',
  'API returning stale data after update',
  'Unable to unsubscribe from digest emails',
  'Typo in the automated confirmation message',
  'Filter dropdown not resetting between searches',
];

const TASK_SUBJECTS = [
  'Prepare weekly status summary',
  'Review pull requests from the team',
  'Update onboarding documentation',
  'Follow up on outstanding customer questions',
  'Audit access permissions for the quarter',
  'Draft agenda for next sprint planning',
  'Clean up stale tickets in the backlog',
  'Coordinate handoff with the support team',
  'Prepare slides for the stakeholder review',
  'Test the new release candidate build',
];

function pick(array, index) {
  return array[index % array.length];
}

/**
 * Seeds `tickets` and `tasks` for every demo-selectable user (20
 * tickets + 10 tasks each), so switching the mock "logged in as" user
 * (see context/CurrentUserContext.jsx on the frontend) always has real
 * Individual Contribution data to show, not just the primary demo user.
 */
export async function seedTicketsAndTasks(demoUsers) {
  const ticketRecords = [];
  const taskRecords = [];
  const now = Date.now();

  demoUsers.forEach((user, userIndex) => {
    for (let i = 0; i < TICKETS_PER_USER; i++) {
      const status = pick(TICKET_STATUSES, i + userIndex);
      const createdDaysAgo = i * 3 + (userIndex % 5);
      ticketRecords.push({
        title: pick(TICKET_SUBJECTS, i + userIndex),
        description: 'Seed data for local development and testing of the Individual Contribution panel.',
        status,
        priority: pick(PRIORITY_LEVELS, i + userIndex * 2),
        assignedTo: user._id,
        resolvedAt: ['resolved', 'closed'].includes(status)
          ? new Date(now - Math.max(createdDaysAgo - 2, 0) * 24 * 60 * 60 * 1000)
          : null,
        createdAt: new Date(now - createdDaysAgo * 24 * 60 * 60 * 1000),
      });
    }

    for (let i = 0; i < TASKS_PER_USER; i++) {
      const createdDaysAgo = i * 4 + (userIndex % 3);
      taskRecords.push({
        title: pick(TASK_SUBJECTS, i + userIndex),
        description: 'Seed data for local development and testing of the Individual Contribution panel.',
        status: pick(TASK_STATUSES, i + userIndex),
        priority: pick(PRIORITY_LEVELS, i + userIndex * 2),
        assignedTo: user._id,
        dueDate: new Date(now + (TASKS_PER_USER - i) * 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - createdDaysAgo * 24 * 60 * 60 * 1000),
      });
    }
  });

  const [tickets, tasks] = await Promise.all([
    Ticket.insertMany(ticketRecords),
    Task.insertMany(taskRecords),
  ]);

  return { tickets, tasks };
}
