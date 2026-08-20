import { User } from '../../src/models/index.js';
import { getOsUsername } from '../../src/utils/machineIdentity.js';

import { buildNamePool, JOB_TITLES_BY_ROLE } from './nameData.mjs';

const TOTAL_USERS = 100;
// How many of the seeded users get rich ticket/task history (see
// seedTicketsAndTasks.mjs) and a guaranteed rank on the latest
// leaderboard snapshot (see seedLeaderboard.mjs) -- keeps the Dashboard
// interesting for whichever of these accounts someone logs into,
// without generating that volume of activity data for all 100.
const ACTIVITY_USER_COUNT = 20;
const ROLE_CYCLE = ['employee', 'employee', 'employee', 'manager', 'employee', 'employee', 'admin'];

/**
 * Real, specific accounts that must always exist with this exact
 * name/email/role -- unlike the generated pool below (deterministic but
 * synthetic), these aren't randomized and never change on re-seed.
 * Placed first in `records` so each one also lands in `activityUsers`
 * (gets ticket/task history) and the first entry doubles as
 * `primaryUser` (guaranteed leaderboard rank 7 -- see seedLeaderboard.mjs).
 */
const PINNED_USERS = [{ name: 'Habeeb Mohammed', email: 'habeeb.mohd555@gmail.com', role: 'admin' }];

/**
 * Builds a pinned account whose `alias` (auto-derived from the email's
 * local part -- see User.model.js) matches whichever OS username is
 * actually running this seed script, so login's now-mandatory device
 * lock (AuthService.verifyOtp, utils/machineIdentity.js) always has at
 * least one guaranteed-working account on whatever machine `npm run
 * seed` is run on -- no manual `npm run set-alias` step needed for the
 * common case. Returns `[]` (no user added) if the OS username can't be
 * read, or sanitizes down to nothing usable in an email local part
 * (e.g. only whitespace/symbols) -- seeding still succeeds either way,
 * this is a convenience, not a requirement.
 */
function buildLocalMachineUser() {
  const osUsername = getOsUsername();
  if (!osUsername) return [];

  const emailLocalPart = osUsername.toLowerCase().replace(/[^a-z0-9.]+/g, '');
  if (!emailLocalPart) return [];

  return [{ name: `Local Admin (${osUsername})`, email: `${emailLocalPart}@sample.com`, role: 'admin' }];
}

function pickJobTitle(role, index) {
  const titles = JOB_TITLES_BY_ROLE[role];
  return titles[index % titles.length];
}

/**
 * Seeds `users` -- the pinned real accounts above, plus 100 generated
 * ones. Every one of them is a real login (email OTP, see
 * routes/v1/auth.routes.js -- there's no password and no separate
 * "demo account" concept anymore). The first `ACTIVITY_USER_COUNT`
 * (pinned users first, then generated ones) get the richer
 * ticket/task/leaderboard seed data (see scripts/seed.mjs); the rest
 * still exist as ordinary accounts and leaderboard participants, just
 * with no ticket/task history.
 */
export async function seedUsers() {
  const namePool = buildNamePool(TOTAL_USERS);

  const allPinnedUsers = [...PINNED_USERS, ...buildLocalMachineUser()];
  const pinnedRecords = allPinnedUsers.map((user, index) => ({
    ...user,
    jobTitle: pickJobTitle(user.role, index),
  }));

  const generatedRecords = namePool.map(({ name, email }, index) => {
    const role = ROLE_CYCLE[index % ROLE_CYCLE.length];
    return {
      name,
      email,
      role,
      jobTitle: pickJobTitle(role, index),
    };
  });

  const created = await User.insertMany([...pinnedRecords, ...generatedRecords]);

  const activityUsers = created.slice(0, ACTIVITY_USER_COUNT);
  return { allUsers: created, activityUsers, primaryUser: activityUsers[0] };
}
