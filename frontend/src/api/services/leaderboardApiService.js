import httpClient from '../httpClient.js';

/**
 * Not a plain CRUD resource -- a leaderboard snapshot is a small,
 * bounded, ranked list for one date, not a paginated collection (see
 * backend/src/services/LeaderboardService.js). Doesn't extend
 * ApiService for the same reason api/healthApi.js and
 * api/services/authApiService.js don't: this is a one-off/custom
 * endpoint shape, not create/read/update/delete over records.
 */
class LeaderboardApiService {
  /**
   * Ranked entries for a period. Pass `{ date }` for a specific
   * snapshot, or `{ years, months }` (each an optional comma-separated
   * list) for the Dashboard's multi-select Year/Month filter -- the
   * backend resolves that selection's most recent snapshot (see
   * LeaderboardService.getEntriesForPeriod). No args falls back to the
   * latest snapshot overall.
   */
  async getEntries({ date, years, months } = {}) {
    const params = {};
    if (date) params.date = date;
    if (years) params.years = years;
    if (months) params.months = months;
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
