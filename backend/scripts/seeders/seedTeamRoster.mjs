import { CxoTeam, TeamRosterEntry } from '../../src/models/index.js';
import { toUtcDateOnly } from '../../src/utils/date.js';

// Mostly 'available', with the occasional day of Training/Reconciliation/
// MFA/Dlaunch/PTO/ePTO/Other -- same weighting seedCxoTeams.mjs uses for
// each member's starting support value, kept here as its own copy since
// roster generation runs on a per-day cycle, not a per-member one.
const SUPPORT_CYCLE = [
  'available',
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
const SHIFTS = ['9:00 AM to 6:00 PM', '11:00 AM to 8:00 PM', '2:00 PM to 11:00 PM'];

// Same support -> time slot pairing seedCxoTeams.mjs uses (see that
// file's docblock) -- kept as its own copy for the same "per-day cycle,
// not per-member" reason SUPPORT_CYCLE above is duplicated rather than
// imported.
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

function pick(array, index) {
  return array[((index % array.length) + array.length) % array.length];
}

/**
 * Seeds a month-to-date roster: one team_roster_entries row per
 * `members` per calendar day, from the 1st of the current month through
 * today -- so the Team Members page's roster stats bar (see
 * TeamRosterStatsBar.jsx) and Shifts schedule grid both have real
 * day/week/month variety to show without anyone needing to upload a CSV
 * first. Mirrors what TeamRosterService.importRoster would produce from
 * a real monthly upload, including syncing each member's
 * CxoTeam.support/shift/timeSlot to their last generated day (what
 * TeamRosterService.syncCurrentSupport does on a real import) -- this is
 * a seeder, so it writes directly to both models rather than going
 * through TeamRosterService itself (see seed.mjs's docblock for why
 * seeders bypass the service layer).
 */
export async function seedTeamRoster(members) {
  const now = new Date();
  const monthStart = toUtcDateOnly(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const today = toUtcDateOnly(now);
  const dayCount = Math.floor((today.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  const entries = [];
  const latestByMember = new Map();

  members.forEach((member, memberIndex) => {
    const shift = pick(SHIFTS, memberIndex);

    for (let dayOffset = 0; dayOffset < dayCount; dayOffset++) {
      const date = new Date(monthStart.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      // A deterministic-but-varied pick per (member, day) pair, so the
      // same member isn't on Reconciliation every single day and
      // different members don't all share the exact same pattern.
      const support = pick(SUPPORT_CYCLE, memberIndex * 3 + dayOffset * 5);
      const timeSlot = SUPPORT_TIME_SLOTS[support];
      entries.push({ member: member._id, date, support, shift, timeSlot });
      latestByMember.set(String(member._id), { support, shift, timeSlot });
    }
  });

  const created = await TeamRosterEntry.insertMany(entries);

  await Promise.all(
    [...latestByMember.entries()].map(([memberId, { support, shift, timeSlot }]) =>
      CxoTeam.updateOne({ _id: memberId }, { $set: { support, shift, timeSlot } }),
    ),
  );

  return created;
}
