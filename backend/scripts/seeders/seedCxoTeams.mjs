import mongoose from 'mongoose';

import { CxoTeam } from '../../src/models/index.js';

import { buildNamePool } from './nameData.mjs';

// Users seeded 100 names starting at offset 0 (see seedUsers.mjs) --
// this seeder takes its own non-overlapping slice of the same
// deterministic name pool so the two collections never generate
// identical rosters.
const NAME_POOL_OFFSET = 100;

const GROUPS = ['Engineering', 'Product', 'Sales', 'Finance'];
const DIRECTORS_PER_CEO = GROUPS.length;
const MANAGERS_PER_DIRECTOR = 2;
const IC_COUNT = 12;
const TOTAL_MEMBERS = 1 + DIRECTORS_PER_CEO + DIRECTORS_PER_CEO * MANAGERS_PER_DIRECTOR + IC_COUNT; // 25

const IC_DESIGNATIONS_BY_GROUP = {
  Engineering: ['Senior Software Engineer', 'Software Engineer', 'QA Engineer'],
  Product: ['Senior Product Analyst', 'Product Analyst'],
  Sales: ['Senior Account Executive', 'Account Executive'],
  Finance: ['Senior Financial Analyst', 'Financial Analyst'],
};

const LOCATIONS = [
  { location: 'Bangalore', place: 'HQ Tower' },
  { location: 'Austin', place: 'Riverside Campus' },
  { location: 'London', place: 'Canary Wharf Office' },
  { location: 'Singapore', place: 'Marina Bay Office' },
];

function pick(array, index) {
  return array[index % array.length];
}

/**
 * Seeds `cxo_teams` -- a small, deliberately shaped leadership
 * hierarchy (1 CEO -> 4 Directors -> 8 Managers -> 12 individual
 * contributors, 25 total) so the Team Members page and its
 * lead/manager self-references (see CxoTeam.model.js) have real
 * reporting-chain data to render and filter, instead of an empty page.
 *
 * `_id`s are pre-generated (rather than left to Mongo) specifically so
 * `lead`/`manager` can reference a person earlier in this same batch
 * before `insertMany` has run.
 *
 * Returns `{ all, ceo, directors, managers }` (created documents, not
 * just ids) so seedCxoPermissions can grant permissions to a realistic
 * spread of members without re-deriving who's who from the roster.
 */
export async function seedCxoTeams() {
  const namePool = buildNamePool(TOTAL_MEMBERS, NAME_POOL_OFFSET);
  const ids = namePool.map(() => new mongoose.Types.ObjectId());

  const records = [];
  let cursor = 0;

  // Index 0: CEO
  const ceoIndex = cursor;
  cursor += 1;
  records.push(buildRecord({ index: ceoIndex, ids, namePool, designation: 'Chief Executive Officer', level: 'L1', group: 'Executive', lead: null, manager: null }));

  // Indexes 1..4: Directors, one per group, reporting to the CEO
  const directorIndexes = [];
  GROUPS.forEach((group) => {
    const index = cursor;
    cursor += 1;
    directorIndexes.push(index);
    records.push(
      buildRecord({
        index,
        ids,
        namePool,
        designation: `Director of ${group}`,
        level: 'L2',
        group,
        lead: ids[ceoIndex],
        manager: ids[ceoIndex],
      }),
    );
  });

  // Indexes 5..12: Managers, MANAGERS_PER_DIRECTOR per director
  const managerIndexesByGroup = {};
  directorIndexes.forEach((directorIndex, groupPosition) => {
    const group = GROUPS[groupPosition];
    managerIndexesByGroup[group] = [];
    for (let i = 0; i < MANAGERS_PER_DIRECTOR; i++) {
      const index = cursor;
      cursor += 1;
      managerIndexesByGroup[group].push(index);
      records.push(
        buildRecord({
          index,
          ids,
          namePool,
          designation: `${group} Manager`,
          level: 'L3',
          group,
          lead: ids[directorIndex],
          manager: ids[directorIndex],
        }),
      );
    }
  });

  // Indexes 13..24: individual contributors, cycled across every manager
  const allManagerIndexes = Object.values(managerIndexesByGroup).flat();
  for (let i = 0; i < IC_COUNT; i++) {
    const index = cursor;
    cursor += 1;
    const managerIndex = pick(allManagerIndexes, i);
    const group = GROUPS.find((g) => managerIndexesByGroup[g].includes(managerIndex));
    records.push(
      buildRecord({
        index,
        ids,
        namePool,
        designation: pick(IC_DESIGNATIONS_BY_GROUP[group], i),
        level: 'L4',
        group,
        lead: ids[managerIndex],
        manager: ids[managerIndex],
      }),
    );
  }

  const created = await CxoTeam.insertMany(records);
  const allManagerIndexesFlat = Object.values(managerIndexesByGroup).flat();

  return {
    all: created,
    ceo: created[ceoIndex],
    directors: directorIndexes.map((index) => created[index]),
    managers: allManagerIndexesFlat.map((index) => created[index]),
  };
}

function buildRecord({ index, ids, namePool, designation, level, group, lead, manager }) {
  const { name, email } = namePool[index];
  const { location, place } = pick(LOCATIONS, index);
  const now = Date.now();

  return {
    _id: ids[index],
    name,
    emailId: email,
    empIdNew: `EMP2${String(index).padStart(3, '0')}`,
    empIdOld: index % 5 === 0 ? `LEGACY-${1000 + index}` : undefined,
    designation,
    level,
    location,
    place,
    lead,
    manager,
    group,
    status: index % 11 === 0 ? 'on-leave' : 'active',
    joiningDate: new Date(now - (900 - index * 20) * 24 * 60 * 60 * 1000),
  };
}
