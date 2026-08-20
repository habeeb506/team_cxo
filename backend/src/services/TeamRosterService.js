import TeamRosterEntryRepository from '../repositories/TeamRosterEntryRepository.js';
import CxoTeamRepository from '../repositories/CxoTeamRepository.js';
import { TEAM_MEMBER_SUPPORT_TYPES } from '../config/constants.js';
import { toUtcDateOnly, formatUtcDateOnly, resolvePeriodRange } from '../utils/date.js';

import BaseService from './BaseService.js';

class TeamRosterService extends BaseService {
  constructor() {
    super(new TeamRosterEntryRepository(), 'Team roster entry');
    // Direct repository dependency, the same documented exception
    // TaskService takes for HolidayRepository -- importRoster needs to
    // resolve "Employee Email" -> CxoTeam._id and syncCurrentSupport
    // needs to write the latest support/shift back onto the member
    // document, neither of which is a CxoTeam CRUD operation a full
    // CxoTeamService call would be a better fit for.
    this.cxoTeamRepository = new CxoTeamRepository();
  }

  /**
   * Imports one month's roster: `records` is `[{ email, date, support,
   * shift?, timeSlot? }]`, one row per person per day
   * (see features/cxoTeams/useTeamRosterUpload.js on the frontend for
   * how a CSV is parsed into this shape). Each row is resolved and
   * upserted independently -- a bad row (unknown email, invalid date,
   * invalid support value) is collected into `failed` and skipped, the
   * same per-row error reporting every other CSV import in this app
   * uses (BaseService.bulkCreate), even though this isn't bulkCreate
   * itself (roster rows upsert by (member, date) instead of always
   * inserting). After every row is processed, every touched member's
   * `CxoTeam.support`/`shift` is refreshed from their true latest entry
   * (syncCurrentSupport) -- not just from this batch, in case an older
   * correction was uploaded after a newer entry already existed.
   */
  async importRoster(records) {
    const created = [];
    const failed = [];
    const touchedMemberIds = new Map();

    for (let i = 0; i < records.length; i++) {
      const row = records[i] || {};
      try {
        const email = String(row.email || '').trim().toLowerCase();
        if (!email) throw new Error('Employee Email is required');

        const member = await this.cxoTeamRepository.findOne({ emailId: email });
        if (!member) throw new Error(`No team member found with email ${email}`);

        const date = toUtcDateOnly(row.date);
        if (Number.isNaN(date.getTime())) throw new Error('Date is invalid or missing');

        const support = String(row.support || '').trim().toLowerCase();
        if (!TEAM_MEMBER_SUPPORT_TYPES.includes(support)) {
          throw new Error(`Support must be one of: ${TEAM_MEMBER_SUPPORT_TYPES.join(', ')}`);
        }

        const entry = await this.repository.upsertEntry({
          member: member._id,
          date,
          support,
          shift: row.shift ? String(row.shift).trim() : undefined,
          timeSlot: row.timeSlot ? String(row.timeSlot).trim() : undefined,
        });

        created.push(entry);
        touchedMemberIds.set(String(member._id), member._id);
      } catch (err) {
        failed.push({ row: i + 1, message: err.message });
      }
    }

    await this.syncCurrentSupport([...touchedMemberIds.values()]);

    return { created, failed };
  }

  /**
   * Copies each member's most recent team_roster_entries row onto their
   * CxoTeam.support/shift/timeSlot, so the Team Members table can show
   * "today's" support assignment directly from `cxo_teams` without
   * joining against the roster on every list request. Called after
   * every import for whichever members that import touched.
   */
  async syncCurrentSupport(memberIds) {
    if (memberIds.length === 0) return;
    const latestEntries = await this.repository.findLatestPerMember(memberIds);
    await Promise.all(
      latestEntries.map((entry) =>
        this.cxoTeamRepository.updateById(entry._id, {
          support: entry.support,
          shift: entry.shift || undefined,
          timeSlot: entry.timeSlot || undefined,
        }),
      ),
    );
  }

  /**
   * Stats for the roster stats bar: total team size (independent of any
   * period -- headcount doesn't change based on what week you're
   * looking at) plus, for the resolved day/week/month range (see
   * utils/date.js's resolvePeriodRange), how many distinct people had
   * each support assignment at least once in that range. `counts` is
   * always zero-filled for every value in TEAM_MEMBER_SUPPORT_TYPES,
   * even ones with no entries, so the frontend never has to guess
   * whether a missing key means zero or means "not fetched yet".
   */
  async getStats({ period = 'day', date } = {}) {
    const { start, end } = resolvePeriodRange(period, date);

    const [totalTeamCount, supportCounts] = await Promise.all([
      this.cxoTeamRepository.count({}),
      this.repository.getDistinctMembersBySupport({ start, end }),
    ]);

    const counts = Object.fromEntries(TEAM_MEMBER_SUPPORT_TYPES.map((support) => [support, 0]));
    supportCounts.forEach(({ _id, count }) => {
      if (_id in counts) counts[_id] = count;
    });

    return {
      period,
      start: formatUtcDateOnly(start),
      // `end` is exclusive (see resolvePeriodRange) -- the last day
      // actually included in the range is one day before it.
      end: formatUtcDateOnly(new Date(end.getTime() - 1)),
      totalTeamCount,
      counts,
    };
  }

  /**
   * The Monday-Sunday week containing `date` (default today), shaped for
   * the Team Members page's Shifts-style schedule grid (`TeamShiftsGrid.jsx`):
   * one entry per (member, day) with the member's `name` already
   * populated, so the frontend can group rows by member without a
   * separate lookup. Reuses `resolvePeriodRange('week', ...)` -- the same
   * Monday-Sunday week the roster stats bar's "Week" period already
   * uses, so a person's schedule always lines up with the same week
   * boundaries as the rest of the page.
   */
  async getWeeklySchedule({ date } = {}) {
    const { start, end } = resolvePeriodRange('week', date);
    const entries = await this.repository.findByDateRange({ start, end });

    return {
      start: formatUtcDateOnly(start),
      end: formatUtcDateOnly(new Date(end.getTime() - 1)),
      entries: entries.map((entry) => ({
        _id: entry._id,
        member: entry.member ? { _id: entry.member._id, name: entry.member.name } : null,
        date: formatUtcDateOnly(entry.date),
        support: entry.support,
        shift: entry.shift,
        timeSlot: entry.timeSlot,
      })),
    };
  }
}

export default TeamRosterService;
