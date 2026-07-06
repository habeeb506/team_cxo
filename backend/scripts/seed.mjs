#!/usr/bin/env node
/**
 * Seeds local MongoDB with dummy data for the Dashboard's role-based
 * widgets: Users (dummy accounts + leaderboard participants), News
 * Bulletin, Tickets, Tasks, and Leaderboard snapshots.
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
import { NewsBulletin, Task, Ticket, User, LeaderboardEntry } from '../src/models/index.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

import { seedUsers } from './seeders/seedUsers.mjs';
import { seedNewsBulletins } from './seeders/seedNewsBulletins.mjs';
import { seedTicketsAndTasks } from './seeders/seedTicketsAndTasks.mjs';
import { seedLeaderboard } from './seeders/seedLeaderboard.mjs';

async function clearCollections() {
  await Promise.all([
    User.deleteMany({}),
    NewsBulletin.deleteMany({}),
    Ticket.deleteMany({}),
    Task.deleteMany({}),
    LeaderboardEntry.deleteMany({}),
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
