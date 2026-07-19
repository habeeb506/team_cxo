import { LeaderboardEntry } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class LeaderboardEntryRepository extends BaseRepository {
  constructor() {
    super(LeaderboardEntry);
  }

  /** Every entry for one snapshot date, with the user's display fields. */
  findAllForDate(snapshotDate) {
    return this.model
      .find(this.withDeletedFilter({ snapshotDate }))
      .populate('user', 'name email role jobTitle')
      .exec();
  }

  /** Every distinct snapshot date that has data, most recent first. */
  async getDistinctDates() {
    const dates = await this.model.distinct('snapshotDate', this.withDeletedFilter({}));
    return dates.sort((a, b) => new Date(b) - new Date(a));
  }

  /** The most recent snapshot date, or null if no snapshots exist yet. */
  async getLatestDate() {
    const doc = await this.model
      .findOne(this.withDeletedFilter({}))
      .sort('-snapshotDate')
      .select('snapshotDate')
      .exec();
    return doc?.snapshotDate ?? null;
  }

  /**
   * The most recent snapshot date within [start, end), or null if no
   * snapshot falls in that range. Backs the Year/Month filter (see
   * LeaderboardService.getEntriesForPeriod) -- snapshots are weekly, so
   * a chosen period may contain zero, one, or several.
   */
  async getLatestDateInRange(start, end) {
    const doc = await this.model
      .findOne(this.withDeletedFilter({ snapshotDate: { $gte: start, $lt: end } }))
      .sort('-snapshotDate')
      .select('snapshotDate')
      .exec();
    return doc?.snapshotDate ?? null;
  }
}

export default LeaderboardEntryRepository;
