import { CxoTeam } from '../../src/models/index.js';

import { buildNamePool } from './nameData.mjs';

// seedUsers() already consumes the first 100 entries of the shared name
// pool (see nameData.mjs) -- offsetting past those keeps this roster's
// names/emails distinct from the Dashboard's mock "logged in as" users.
const NAME_POOL_OFFSET = 100;

const LOCATIONS = ['Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai', 'Delhi NCR'];
const PLACES = ['HQ Tower', 'Tech Park', 'Block A', 'Block B', 'Innovation Center', 'Campus 2'];

/**
 * Eight levels, L8 (top) down to L1 (bottom), each fanning out roughly
 * evenly across the previous level's members via `manager` -- the same
 * self-referencing field ARCHITECTURE.md describes as what makes
 * org-chart traversal possible. L7's `groups` gives each CXO their own
 * division; every level below inherits its parent's group so an entire
 * division (Engineering, Operations, ...) traces back to one L7 exec.
 */
const LEVEL_CONFIG = [
  { level: 'L8', count: 1, titles: ['Managing Director'] },
  {
    level: 'L7',
    count: 4,
    titles: ['Chief Technology Officer', 'Chief Operating Officer', 'Chief Financial Officer', 'Chief Marketing Officer'],
    groups: ['Engineering', 'Operations', 'Finance', 'Marketing'],
  },
  { level: 'L6', count: 8, titles: ['Senior Vice President', 'Vice President'] },
  { level: 'L5', count: 12, titles: ['Director', 'Associate Director'] },
  { level: 'L4', count: 18, titles: ['Senior Manager', 'Program Manager'] },
  { level: 'L3', count: 24, titles: ['Manager', 'Assistant Manager'] },
  { level: 'L2', count: 28, titles: ['Team Lead', 'Senior Associate'] },
  { level: 'L1', count: 30, titles: ['Associate', 'Analyst', 'Engineer', 'Specialist'] },
];

const TOTAL_COUNT = LEVEL_CONFIG.reduce((sum, { count }) => sum + count, 0);

/**
 * Seeds `cxo_teams` with a full 8-level (L1-L8) reporting hierarchy so
 * the Team Hierarchy org chart has real, deep data to render -- L8 is
 * the single MD at the top; every record below links to a `manager`
 * one level up, round-robin across that level's members.
 */
export async function seedCxoTeams() {
  const namePool = buildNamePool(TOTAL_COUNT, NAME_POOL_OFFSET);
  let poolIndex = 0;
  let empSeq = 1000;
  let locationIndex = 0;

  let previousLevel = []; // [{ _id, group }] for the level just inserted
  const allCreated = [];

  for (const levelConfig of LEVEL_CONFIG) {
    const plannedRecords = [];

    for (let i = 0; i < levelConfig.count; i++) {
      const { name, email } = namePool[poolIndex++];
      const designation = levelConfig.titles[i % levelConfig.titles.length];

      let group;
      let managerId = null;
      if (levelConfig.level === 'L8') {
        group = 'Executive';
      } else if (levelConfig.groups) {
        group = levelConfig.groups[i % levelConfig.groups.length];
        managerId = previousLevel[i % previousLevel.length]._id;
      } else {
        const parent = previousLevel[i % previousLevel.length];
        group = parent.group;
        managerId = parent._id;
      }

      plannedRecords.push({
        name,
        emailId: email,
        empIdNew: `CXO${empSeq++}`,
        level: levelConfig.level,
        designation,
        group,
        location: LOCATIONS[locationIndex % LOCATIONS.length],
        place: PLACES[locationIndex % PLACES.length],
        manager: managerId,
        lead: managerId,
        status: 'active',
      });
      locationIndex++;
    }

    const created = await CxoTeam.insertMany(plannedRecords);
    previousLevel = created.map((doc, idx) => ({ _id: doc._id, group: plannedRecords[idx].group }));
    allCreated.push(...created);
  }

  return allCreated;
}
