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
   * The most recent snapshot date matching the multi-select Year/Month
   * filter (either/both axes, AND'd together -- see
   * utils/queryOptions.js's buildListQueryOptions for the same
   * `$expr`/`$year`/`$month` approach), or null if no snapshot matches.
   * Backs the Year/Month filter (see LeaderboardService.getEntriesForPeriod)
   * -- snapshots are weekly, so a chosen period may contain zero, one,
   * or several.
   */
  async getLatestDateMatching({ years = [], months = [] } = {}) {
    const exprClauses = [];
    if (years.length > 0) exprClauses.push({ $in: [{ $year: '$snapshotDate' }, years] });
    if (months.length > 0) exprClauses.push({ $in: [{ $month: '$snapshotDate' }, months] });

    const filter = this.withDeletedFilter(
      exprClauses.length > 0 ? { $expr: exprClauses.length > 1 ? { $and: exprClauses } : exprClauses[0] } : {},
    );

    const doc = await this.model.findOne(filter).sort('-snapshotDate').select('snapshotDate').exec();
    return doc?.snapshotDate ?? null;
  }
}

export default LeaderboardEntryRepository;
