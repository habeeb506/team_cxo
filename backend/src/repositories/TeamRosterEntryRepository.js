import { TeamRosterEntry } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class TeamRosterEntryRepository extends BaseRepository {
  constructor() {
    super(TeamRosterEntry);
  }

  /**
   * Inserts or overwrites the one entry allowed per (member, date) --
   * see the model's partial unique index. Re-uploading a corrected
   * roster for a month naturally "wins" over what was there before,
   * rather than erroring as a duplicate the way a plain `create` would.
   */
  async upsertEntry({ member, date, support, shift, timeSlot }) {
    return this.model
      .findOneAndUpdate(
        this.withDeletedFilter({ member, date }, false),
        { $set: { support, shift: shift || null, timeSlot: timeSlot || null }, $setOnInsert: { member, date } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  /**
   * The most recent entry per member in `memberIds` -- feeds
   * TeamRosterService.syncCurrentSupport, which copies each result's
   * support/shift/timeSlot onto the matching CxoTeam document. Returns
   * `[{ _id: memberId, support, shift, timeSlot, date }]`.
   */
  async findLatestPerMember(memberIds) {
    return this.model.aggregate([
      { $match: { member: { $in: memberIds }, isDeleted: { $ne: true } } },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: '$member',
          support: { $first: '$support' },
          shift: { $first: '$shift' },
          timeSlot: { $first: '$timeSlot' },
          date: { $first: '$date' },
        },
      },
    ]);
  }

  /**
   * Every entry in `[start, end)`, member's `name` populated -- feeds
   * TeamRosterService.getWeeklySchedule (the Team Members page's
   * Shifts-style schedule grid, one row per member and one column per
   * day of the resolved week). Unlike getDistinctMembersBySupport below
   * (which only needs counts), the grid needs the actual per-day
   * support/shift/timeSlot values and a human-readable member label.
   */
  async findByDateRange({ start, end }) {
    return this.model
      .find(this.withDeletedFilter({ date: { $gte: start, $lt: end } }, false))
      .populate('member', 'name')
      .sort({ date: 1 })
      .exec();
  }

  /**
   * For every support value, how many *distinct* members had that
   * support assignment on at least one day within `[start, end)` -- the
   * "how many people were on Reconciliation this week" reading the
   * roster stats bar uses, rather than counting every day-instance
   * (someone on Reconciliation for 3 days counts once, not 3 times).
   * Returns `[{ _id: support, count }]`; callers zero-fill any support
   * value missing from the result (nobody had it).
   */
  async getDistinctMembersBySupport({ start, end }) {
    return this.model.aggregate([
      { $match: { date: { $gte: start, $lt: end }, isDeleted: { $ne: true } } },
      { $group: { _id: { member: '$member', support: '$support' } } },
      { $group: { _id: '$_id.support', count: { $sum: 1 } } },
    ]);
  }
}

export default TeamRosterEntryRepository;
