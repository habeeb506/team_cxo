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
  /** All ranked entries for a date (defaults to the latest snapshot). */
  async getEntries(date) {
    const { data } = await httpClient.get('/v1/leaderboard/entries', { params: date ? { date } : {} });
    return data; // { success, data: entries[], date }
  }

  /** Every snapshot date available, most recent first -- for the date picker. */
  async getDates() {
    const { data } = await httpClient.get('/v1/leaderboard/dates');
    return data; // { success, data: string[] }
  }
}

export default new LeaderboardApiService();
