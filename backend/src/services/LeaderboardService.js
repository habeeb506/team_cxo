import LeaderboardEntryRepository from '../repositories/LeaderboardEntryRepository.js';
import { formatUtcDateOnly, toUtcDateOnly } from '../utils/date.js';
import { parseCsvIntList } from '../utils/queryOptions.js';

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

  /**
   * Entries for the Dashboard's multi-select Year/Month filter (see
   * components/dashboard/YearMonthFilter.jsx on the frontend): a
   * specific `date` wins if given (unchanged point-in-time behavior),
   * otherwise `years`/`months` (each an optional comma-separated list,
   * either/both given -- see validations/common/yearMonthQuery.schema.js)
   * resolve to that selection's most recent snapshot. No filter at all
   * falls back to the latest snapshot overall, same as
   * getEntriesForDate(undefined).
   */
  async getEntriesForPeriod({ date, years, months } = {}) {
    if (date) return this.getEntriesForDate(date);

    const yearsList = parseCsvIntList(years);
    const monthsList = parseCsvIntList(months);

    if (yearsList.length > 0 || monthsList.length > 0) {
      const snapshotDate = await this.repository.getLatestDateMatching({
        years: yearsList,
        months: monthsList,
      });
      if (!snapshotDate) return { date: null, entries: [] };
      return this.getEntriesForDate(snapshotDate);
    }

    return this.getEntriesForDate(undefined);
  }
}

export default LeaderboardService;
