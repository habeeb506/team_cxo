#!/usr/bin/env node
/**
 * Seeds local MongoDB with dummy data for the Dashboard's role-based
 * widgets (Users, News Bulletin, Tickets, Tasks, Leaderboard snapshots)
 * and the management pages (Team Members, Business Teams, Permissions).
 *
 * Run with: npm run seed --prefix backend  (or `cd backend && npm run seed`)
 *
 * This is a one-off operational/dev script, not part of the running
 * app -- unlike every request-time code path, it intentionally writes
 * to models directly (via Mongoose `insertMany`) instead of going
 * through repositories/services. That's deliberate here: seeders need
 * a hard `deleteMany` (not the app's normal soft delete) so re-running
 * this script always starts from a clean slate.
 *
 * Safe to re-run: every affected collection is fully cleared first.
 */
import {
  NewsBulletin,
  Task,
  Ticket,
  User,
  LeaderboardEntry,
  CxoTeam,
  BusinessTeam,
  CxoPermission,
  Appointment,
  Voc,
  ShoutOut,
  Award,
  Holiday,
  TeamRosterEntry,
} from '../src/models/index.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

import { seedUsers } from './seeders/seedUsers.mjs';
import { seedNewsBulletins } from './seeders/seedNewsBulletins.mjs';
import { seedTicketsAndTasks } from './seeders/seedTicketsAndTasks.mjs';
import { seedLeaderboard } from './seeders/seedLeaderboard.mjs';
import { seedCxoTeams } from './seeders/seedCxoTeams.mjs';
import { seedBusinessTeams } from './seeders/seedBusinessTeams.mjs';
import { seedCxoPermissions } from './seeders/seedCxoPermissions.mjs';
import { seedAppointments } from './seeders/seedAppointments.mjs';
import { seedVocs } from './seeders/seedVocs.mjs';
import { seedShoutOuts } from './seeders/seedShoutOuts.mjs';
import { seedAwards } from './seeders/seedAwards.mjs';
import { seedHolidays } from './seeders/seedHolidays.mjs';
import { seedTeamRoster } from './seeders/seedTeamRoster.mjs';

async function clearCollections() {
  await Promise.all([
    User.deleteMany({}),
    NewsBulletin.deleteMany({}),
    Ticket.deleteMany({}),
    Task.deleteMany({}),
    LeaderboardEntry.deleteMany({}),
    CxoTeam.deleteMany({}),
    BusinessTeam.deleteMany({}),
    CxoPermission.deleteMany({}),
    Appointment.deleteMany({}),
    Voc.deleteMany({}),
    ShoutOut.deleteMany({}),
    Award.deleteMany({}),
    Holiday.deleteMany({}),
    TeamRosterEntry.deleteMany({}),
  ]);
}

async function run() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  console.log('Clearing existing seed-managed collections...');
  await clearCollections();

  console.log('Seeding users...');
  const { allUsers, activityUsers, primaryUser } = await seedUsers();
  console.log(`  ${allUsers.length} users created (${activityUsers.length} with rich ticket/task history).`);
  console.log(`  Primary user (rank 7 on latest leaderboard): ${primaryUser.name} <${primaryUser.email}>`);

  console.log('Seeding news bulletins...');
  const bulletins = await seedNewsBulletins();
  console.log(`  ${bulletins.length} news bulletins created.`);

  console.log('Seeding tickets and tasks...');
  const { tickets, tasks } = await seedTicketsAndTasks(activityUsers);
  console.log(`  ${tickets.length} tickets and ${tasks.length} tasks created.`);

  console.log('Seeding leaderboard snapshots...');
  const entries = await seedLeaderboard(allUsers, primaryUser);
  console.log(`  ${entries.length} leaderboard entries created.`);

  console.log('Seeding cxo_teams (leadership hierarchy)...');
  const { all: teamMembers, ceo, directors, managers } = await seedCxoTeams();
  console.log(`  ${teamMembers.length} team members created (1 CEO, ${directors.length} directors, ${managers.length} managers, ${teamMembers.length - 1 - directors.length - managers.length} individual contributors).`);

  console.log('Seeding month-to-date team roster...');
  const rosterEntries = await seedTeamRoster(teamMembers);
  console.log(`  ${rosterEntries.length} roster entries created (feeds the Team Members page's roster stats bar).`);

  console.log('Seeding business_teams...');
  const businessTeamMembers = await seedBusinessTeams();
  console.log(`  ${businessTeamMembers.length} business team members created.`);

  console.log('Seeding cxo_permissions...');
  const permissions = await seedCxoPermissions({ ceo, directors, managers });
  console.log(`  ${permissions.length} permission grants created.`);

  console.log('Seeding appointments...');
  const appointments = await seedAppointments(activityUsers);
  console.log(`  ${appointments.length} appointments created.`);

  console.log('Seeding VOCs...');
  const vocs = await seedVocs(activityUsers);
  console.log(`  ${vocs.length} VOC records created.`);

  console.log('Seeding shout-outs...');
  const shoutOuts = await seedShoutOuts(activityUsers);
  console.log(`  ${shoutOuts.length} shout-outs created.`);

  console.log('Seeding awards...');
  const awards = await seedAwards(activityUsers);
  console.log(`  ${awards.length} awards created.`);

  console.log('Seeding holiday calendar...');
  const holidays = await seedHolidays();
  console.log(`  ${holidays.length} holidays created.`);

  console.log('\nSeed complete. Every seeded user can log in via email OTP (POST /api/v1/auth/request-otp).');
  console.log('OTP_DEV_MODE is on by default -- the code is logged here and echoed in the API response, no real email needed.');
  console.log('Accounts with ticket/task history to explore on the Dashboard:');
  activityUsers.forEach((user) => {
    console.log(`  ${user.email} (${user.role}) -- ${user.name}`);
  });

  await disconnectDB();
}

run().catch((error) => {
  console.error('Seed script failed:', error);
  process.exitCode = 1;
});
