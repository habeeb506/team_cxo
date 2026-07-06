#!/usr/bin/env node
/**
 * Seeds local MongoDB with dummy data for the Dashboard's role-based
 * widgets (Users, News Bulletin, Tickets, Tasks, Leaderboard snapshots)
 * and the Team Hierarchy org chart (an 8-level L1-L8 `cxo_teams`
 * reporting structure -- see seeders/seedCxoTeams.mjs). Re-running this
 * overwrites any `cxo_teams` data (including a real CSV import) the
 * same way it does every other seeded collection -- see "Safe to
 * re-run" below.
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
import { NewsBulletin, Task, Ticket, User, LeaderboardEntry, CxoTeam } from '../src/models/index.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

import { seedUsers } from './seeders/seedUsers.mjs';
import { seedNewsBulletins } from './seeders/seedNewsBulletins.mjs';
import { seedTicketsAndTasks } from './seeders/seedTicketsAndTasks.mjs';
import { seedLeaderboard } from './seeders/seedLeaderboard.mjs';
import { seedCxoTeams } from './seeders/seedCxoTeams.mjs';

async function clearCollections() {
  await Promise.all([
    User.deleteMany({}),
    NewsBulletin.deleteMany({}),
    Ticket.deleteMany({}),
    Task.deleteMany({}),
    LeaderboardEntry.deleteMany({}),
    CxoTeam.deleteMany({}),
  ]);
}

async function run() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  console.log('Clearing existing seed-managed collections...');
  await clearCollections();

  console.log('Seeding users...');
  const { allUsers, demoUsers, primaryDemoUser } = await seedUsers();
  console.log(`  ${allUsers.length} users created (${demoUsers.length} demo accounts).`);
  console.log(`  Primary demo user (rank 7 on latest leaderboard): ${primaryDemoUser.name} <${primaryDemoUser.email}>`);

  console.log('Seeding news bulletins...');
  const bulletins = await seedNewsBulletins();
  console.log(`  ${bulletins.length} news bulletins created.`);

  console.log('Seeding tickets and tasks...');
  const { tickets, tasks } = await seedTicketsAndTasks(demoUsers);
  console.log(`  ${tickets.length} tickets and ${tasks.length} tasks created.`);

  console.log('Seeding leaderboard snapshots...');
  const entries = await seedLeaderboard(allUsers, primaryDemoUser);
  console.log(`  ${entries.length} leaderboard entries created.`);

  console.log('Seeding CXO team hierarchy...');
  const cxoTeamMembers = await seedCxoTeams();
  const managingDirector = cxoTeamMembers.find((member) => member.level === 'L8');
  console.log(`  ${cxoTeamMembers.length} team members created across levels L1-L8.`);
  console.log(`  MD (L8): ${managingDirector.name} <${managingDirector.emailId}>`);

  console.log('\nSeed complete. Demo login accounts:');
  demoUsers.forEach((user) => {
    console.log(`  ${user.email} (${user.role}) -- ${user.name}`);
  });

  await disconnectDB();
}

run().catch((error) => {
  console.error('Seed script failed:', error);
  process.exitCode = 1;
});
