import httpClient from '../httpClient.js';

/**
 * Not a plain CRUD resource -- a leaderboard snapshot is a small,
 * bounded, ranked list for one date, not a paginated collection (see
 * backend/src/services/LeaderboardService.js). Doesn't extend
 * ApiService for the same reason api/healthApi.js and api/systemApi.js
 * don't: this is a one-off/custom endpoint shape, not create/read/
 * update/delete over records.
 */
class LeaderboardApiService {
  /**
   * Ranked entries for a period. Pass `{ date }` for a specific
   * snapshot, or `{ year, month }` (month optional) for the Dashboard's
   * Year/Month filter -- the backend resolves that period's most recent
   * snapshot (see LeaderboardService.getEntriesForPeriod). No args
   * falls back to the latest snapshot overall.
   */
  async getEntries({ date, year, month } = {}) {
    const params = {};
    if (date) params.date = date;
    if (year) params.year = year;
    if (month) params.month = month;
    const { data } = await httpClient.get('/v1/leaderboard/entries', { params });
    return data; // { success, data: entries[], date }
  }

  /** Every snapshot date available, most recent first. */
  async getDates() {
    const { data } = await httpClient.get('/v1/leaderboard/dates');
    return data; // { success, data: string[] }
  }
}

export default new LeaderboardApiService();
