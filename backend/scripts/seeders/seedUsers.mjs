import { User } from '../../src/models/index.js';

import { buildNamePool, JOB_TITLES_BY_ROLE } from './nameData.mjs';

const TOTAL_USERS = 100;
const DEMO_ACCOUNT_COUNT = 20;
const ROLE_CYCLE = ['employee', 'employee', 'employee', 'manager', 'employee', 'employee', 'admin'];

function pickJobTitle(role, index) {
  const titles = JOB_TITLES_BY_ROLE[role];
  return titles[index % titles.length];
}

/**
 * Seeds `users` -- 100 total, with the first 20 flagged `isDemoAccount`
 * (offered in the frontend's mock "logged in as" switcher). The first
 * demo account is the designated "current user" the rest of the seed
 * data (tickets, tasks, and the rank-7 leaderboard placement) is built
 * around -- see scripts/seed.mjs.
 */
export async function seedUsers() {
  const namePool = buildNamePool(TOTAL_USERS);

  const records = namePool.map(({ name, email }, index) => {
    const role = ROLE_CYCLE[index % ROLE_CYCLE.length];
    return {
      name,
      email,
      role,
      jobTitle: pickJobTitle(role, index),
      isDemoAccount: index < DEMO_ACCOUNT_COUNT,
    };
  });

  const created = await User.insertMany(records);

  const demoUsers = created.filter((user) => user.isDemoAccount);
  return { allUsers: created, demoUsers, primaryDemoUser: demoUsers[0] };
}
