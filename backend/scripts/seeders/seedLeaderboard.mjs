import { LeaderboardEntry } from '../../src/models/index.js';
import { toUtcDateOnly } from '../../src/utils/date.js';

const SNAPSHOT_COUNT = 6; // today + 5 prior weekly snapshots
const SNAPSHOT_INTERVAL_DAYS = 7;
const PRIMARY_USER_TARGET_RANK = 7; // 1-based -- only enforced on the latest snapshot

/** Small deterministic PRNG (fixed seed) so re-seeding is reproducible. */
function makeRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

function randomInRange(random, min, max) {
  return Math.round(min + random() * (max - min));
}

/**
 * Builds one snapshot's worth of entries for all `users`. Scores are
 * assigned from a strictly-descending slot array so rank (computed at
 * read time by LeaderboardService, never stored) is exact and
 * collision-free -- see LeaderboardEntry.model.js's docblock for why
 * overallScore doesn't need to be mathematically derived from the
 * other fields for seed purposes. `forcedRankUserId` (only used for
 * the latest snapshot) pins that user to `PRIMARY_USER_TARGET_RANK`.
 */
function buildSnapshotEntries(users, snapshotDate, random, forcedRankUserId) {
  // Strictly decreasing score slots, 980 down to roughly 380.
  const scoreSlots = [];
  let current = 980;
  for (let i = 0; i < users.length; i++) {
    scoreSlots.push(current);
    current -= randomInRange(random, 3, 9);
  }

  const userIds = users.map((user) => user._id);
  let orderedIds = [...userIds].sort(() => random() - 0.5);

  if (forcedRankUserId) {
    orderedIds = orderedIds.filter((id) => String(id) !== String(forcedRankUserId));
    orderedIds.splice(PRIMARY_USER_TARGET_RANK - 1, 0, forcedRankUserId);
  }

  return orderedIds.map((userId, index) => {
    // Metrics are independently randomized (better slots trend higher)
    // purely for visual realism -- see this file's docblock.
    const tier = Math.max(1 - index / users.length, 0.15);
    return {
      user: userId,
      snapshotDate,
      tasksCompleted: randomInRange(random, 1, Math.round(12 * tier) + 1),
      ticketsResolved: randomInRange(random, 1, Math.round(18 * tier) + 1),
      vocCount: randomInRange(random, 0, Math.round(10 * tier) + 1),
      shoutOuts: randomInRange(random, 0, Math.round(6 * tier) + 1),
      recognitions: randomInRange(random, 0, Math.round(4 * tier) + 1),
      overallScore: scoreSlots[index],
    };
  });
}

/**
 * Seeds `leaderboard_entries` -- one snapshot per week for the last
 * `SNAPSHOT_COUNT` weeks, across all 100 seeded users, so the
 * Dashboard's Leaderboard date picker has real history to switch
 * between. `primaryDemoUser` is guaranteed rank 7 on the most recent
 * (default) snapshot only -- older snapshots vary naturally.
 */
export async function seedLeaderboard(allUsers, primaryDemoUser) {
  const random = makeRandom(2024);
  const today = toUtcDateOnly(new Date());

  const records = [];
  for (let i = 0; i < SNAPSHOT_COUNT; i++) {
    const snapshotDate = new Date(today.getTime() - i * SNAPSHOT_INTERVAL_DAYS * 24 * 60 * 60 * 1000);
    const isLatest = i === 0;
    records.push(
      ...buildSnapshotEntries(allUsers, snapshotDate, random, isLatest ? primaryDemoUser._id : null),
    );
  }

  return LeaderboardEntry.insertMany(records);
}
