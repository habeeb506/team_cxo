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

// Three shift windows, cycled across the roster -- mirrors the sample
// "Team Hierarchy" upload template's Shift column.
const SHIFTS = ['9:00 AM to 6:00 PM', '11:00 AM to 8:00 PM', '2:00 PM to 11:00 PM'];

// Mostly 'available' (the everyday, nothing-special-to-report state)
// with the occasional Training/Reconciliation/MFA/Dlaunch/PTO/ePTO/
// Other, so the Team Members page and the roster stats bar's initial
// (pre-upload) snapshot both show realistic variety instead of everyone
// identically assigned.
const SUPPORT_CYCLE = [
  'available',
  'available',
  'available',
  'available',
  'training',
  'reconciliation',
  'mfa',
  'dlaunch',
  'pto',
  'epto',
  'other',
];

// Every support value is paired with a time slot it applies to (by
// request -- see CxoTeam.model.js's `timeSlot` field) -- a plausible,
// support-appropriate value rather than an unrelated randomly-cycled
// one, so seeded data reads sensibly (e.g. Training always shows a
// training-shaped window, not "Full day"). PTO is a full day off by
// definition; ePTO (emergency/short-notice PTO) is shown as a half day
// here, since it's more often a same-day partial absence than a
// pre-planned full day.
const SUPPORT_TIME_SLOTS = {
  available: 'Full day',
  training: '10:00 AM - 12:00 PM',
  reconciliation: '2:00 PM - 4:00 PM',
  mfa: '11:00 AM - 12:00 PM',
  dlaunch: '3:00 PM - 5:00 PM',
  pto: 'Full day',
  epto: 'Half day',
  other: '1:00 PM - 2:00 PM',
};

// Base numbers for the (now-numeric, by request) empIdNew/empIdOld
// fields -- see CxoTeam.model.js's docblock on why these switched from
// prefixed strings ("EMP2003", "LEGACY-1005") to plain numbers. Kept as
// distinct base offsets so the two id spaces never collide.
const NEW_EMP_ID_BASE = 2000;
const LEGACY_EMP_ID_BASE = 1000;

// Career/development profile pools -- cycled by index the same way
// SUPPORT_CYCLE/SHIFTS are, purely for seeded-data variety, not meant to
// carry any real-world significance beyond "plausible sample values".
const CAREER_LEVELS = ['Associate', 'Senior Associate', 'Manager', 'Senior Manager', 'Director', 'Executive'];
const PRIOR_EXPERIENCE_YEARS = [0, 1, 2, 3, 5, 8, 10, 12];
const COACHES = ['Priya Sharma', 'James Carter', 'Elena Rodriguez', 'Wei Zhang'];
const PORTFOLIOS = [
  'Retail Banking',
  'Wealth Management',
  'Corporate Banking',
  'Digital Transformation',
  'Risk & Compliance',
  'Cloud Infrastructure',
];
const LEARNING_HOURS = [4, 8, 12, 16, 20, 24, 32, 40];
const BUSINESS_CHEMISTRY_TYPES = ['Pioneer', 'Guardian', 'Driver', 'Integrator'];
const CERTIFICATIONS_PLANNED = ['PMP', 'AWS Solutions Architect', 'CFA Level 1', 'Six Sigma Green Belt', 'None planned'];
const CE_BASELINE_STATUSES = ['On Track', 'Ahead', 'Behind', 'Not Started'];

// A real, specific dummy record that must always exist with this exact
// name/email -- unlike the generated hierarchy below (deterministic but
// synthetic). Same person as the pinned `users` login account (see
// PINNED_USERS in seedUsers.mjs, same email) -- `cxo_teams` and `users`
// are separate collections (org roster display vs. login identity), so
// this is a second, independent document for the same real person, not a
// duplicate. Appended after the generated hierarchy (not part of the
// reporting chain -- no lead/manager), so it doesn't shift any of the
// indexes the hierarchy build below relies on.
const PINNED_MEMBER = {
  name: 'Habeeb Mohammed',
  emailId: 'habeeb.mohd555@gmail.com',
  // Distinct sentinel value, well outside the generated hierarchy's
  // NEW_EMP_ID_BASE + index range (2000-2024) so it can never collide.
  empIdNew: 9999,
  designation: 'Chief Technology Officer',
  level: 'L1',
  careerLevel: 'Executive',
  location: 'Bangalore',
  place: 'HQ Tower',
  group: 'Executive',
  lead: null,
  manager: null,
  priorExperience: 15,
  backupTeamMember: 'Priya Sharma',
  coach: 'James Carter',
  primaryPortfolio: 'Digital Transformation',
  secondaryPortfolio: 'Cloud Infrastructure',
  learningHours: 24,
  businessChemistry: 'Pioneer',
  certificationsPlanned: 'None planned',
  ceBaseline: 'On Track',
  mobile: '+1-555-0100',
};

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

  // Appended last, after every hierarchy record, so `ceoIndex`/
  // `directorIndexes`/`managerIndexesByGroup` (all computed against
  // `records`' original order above) stay valid indexes into `created`.
  const now = Date.now();
  records.push({
    ...PINNED_MEMBER,
    _id: new mongoose.Types.ObjectId(),
    shift: SHIFTS[0],
    support: 'available',
    timeSlot: SUPPORT_TIME_SLOTS.available,
    joiningDate: new Date(now - 1500 * 24 * 60 * 60 * 1000),
  });

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
  const support = pick(SUPPORT_CYCLE, index);
  const now = Date.now();
  const joiningDate = new Date(now - (900 - index * 20) * 24 * 60 * 60 * 1000);

  // Roughly a third of the roster has had a promotion since joining --
  // placed halfway between joiningDate and today. Everyone else's
  // lastPromotionDate stays unset, so CxoTeamService.attachExperienceFields'
  // timeInRole falls back to joiningDate for them (never promoted =
  // "time in role" means "time since they joined").
  const lastPromotionDate =
    index % 3 === 0 ? new Date(joiningDate.getTime() + (now - joiningDate.getTime()) / 2) : undefined;

  return {
    _id: ids[index],
    name,
    emailId: email,
    empIdNew: NEW_EMP_ID_BASE + index,
    empIdOld: index % 5 === 0 ? LEGACY_EMP_ID_BASE + index : undefined,
    designation,
    level,
    careerLevel: pick(CAREER_LEVELS, index),
    location,
    place,
    lead,
    manager,
    group,
    priorExperience: pick(PRIOR_EXPERIENCE_YEARS, index),
    joiningDate,
    lastPromotionDate,
    backupTeamMember: namePool[(index + 5) % namePool.length].name,
    coach: pick(COACHES, index),
    primaryPortfolio: pick(PORTFOLIOS, index),
    secondaryPortfolio: pick(PORTFOLIOS, index + 2),
    otherPortfolio: index % 4 === 0 ? pick(PORTFOLIOS, index + 4) : undefined,
    learningHours: pick(LEARNING_HOURS, index),
    businessChemistry: pick(BUSINESS_CHEMISTRY_TYPES, index),
    certificationsPlanned: pick(CERTIFICATIONS_PLANNED, index),
    ceBaseline: pick(CE_BASELINE_STATUSES, index),
    mobile: `+1-555-01${String(index).padStart(2, '0')}`,
    shift: pick(SHIFTS, index),
    support,
    timeSlot: SUPPORT_TIME_SLOTS[support],
  };
}
