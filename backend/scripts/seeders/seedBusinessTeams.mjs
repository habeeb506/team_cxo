import { BusinessTeam } from '../../src/models/index.js';

import { buildNamePool } from './nameData.mjs';

// Users seeded 100 names at offset 0, cxo_teams took offset 100..124
// (see seedUsers.mjs / seedCxoTeams.mjs) -- this seeder takes the next
// non-overlapping slice so business_teams gets its own distinct roster.
const NAME_POOL_OFFSET = 125;
const MEMBERS_PER_BUSINESS = 5;

const BUSINESS_UNITS = ['Payments', 'Retail Banking', 'Wealth Management', 'Operations', 'Compliance'];
const TOTAL_MEMBERS = BUSINESS_UNITS.length * MEMBERS_PER_BUSINESS; // 25

const SITES = [
  { location: 'Bangalore', place: 'Tech Park', room: '4B-201' },
  { location: 'Austin', place: 'Riverside Campus', room: '2C-110' },
  { location: 'London', place: 'Canary Wharf Office', room: '9F-303' },
  { location: 'Singapore', place: 'Marina Bay Office', room: '6A-115' },
];

function pick(array, index) {
  return array[index % array.length];
}

/**
 * Seeds `business_teams` -- a roster independent of the cxo_teams
 * leadership hierarchy (no cross-reference between the two, see
 * BusinessTeam.model.js), so the Business Teams page has real data to
 * list/filter/search instead of an empty page. `MEMBERS_PER_BUSINESS`
 * people per business unit, evenly spread across a handful of sites.
 */
export async function seedBusinessTeams() {
  const namePool = buildNamePool(TOTAL_MEMBERS, NAME_POOL_OFFSET);

  const records = namePool.map(({ name, email }, index) => {
    const business = BUSINESS_UNITS[Math.floor(index / MEMBERS_PER_BUSINESS)];
    const { location, place, room } = pick(SITES, index);

    return {
      name,
      emailId: email,
      business,
      location,
      place,
      room,
    };
  });

  return BusinessTeam.insertMany(records);
}
