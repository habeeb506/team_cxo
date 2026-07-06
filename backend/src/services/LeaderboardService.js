import LeaderboardEntryRepository from '../repositories/LeaderboardEntryRepository.js';
import { formatUtcDateOnly, toUtcDateOnly } from '../utils/date.js';

import BaseService from './BaseService.js';

class LeaderboardService extends BaseService {
  constructor() {
    super(new LeaderboardEntryRepository(), 'LeaderboardEntry');
  }

  /**
   * Every entry for one date (defaults to the latest available
   * snapshot), ranked by overallScore descending. Rank is computed here
   * rather than stored -- see LeaderboardEntry.model.js's docblock --
   * which is cheap because a snapshot is bounded to the number of
   * people being compared (seeded at 100), not something that grows
   * unbounded over time.
   */
  async getEntriesForDate(dateInput) {
    const snapshotDate = dateInput ? toUtcDateOnly(dateInput) : await this.repository.getLatestDate();
    if (!snapshotDate) return { date: null, entries: [] };

    const entries = await this.repository.findAllForDate(snapshotDate);
    const ranked = [...entries]
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((entry, index) => ({ ...entry.toObject(), rank: index + 1 }));

    return { date: formatUtcDateOnly(snapshotDate), entries: ranked };
  }

  /** Every snapshot date that has data, most recent first, as 'YYYY-MM-DD' strings. */
  async getAvailableDates() {
    const dates = await this.repository.getDistinctDates();
    return dates.map(formatUtcDateOnly);
  }
}

export default LeaderboardService;
