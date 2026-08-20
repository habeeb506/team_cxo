import httpClient from '../httpClient.js';

/**
 * Not an `ApiService` subclass -- the roster isn't a paginated CRUD
 * resource (see backend/src/controllers/teamRoster.controller.js), it's
 * exactly two operations: upload a month, read the stats bar. A 3-line
 * ApiService subclass would inherit getAll/getById/update/remove methods
 * that have no matching backend route and would just be dead code.
 */
class TeamRosterApiService {
  constructor() {
    this.resourcePath = '/v1/team-roster';
  }

  /** `records` is `[{ email, date, support, shift? }]` -- one row per person per support-assignment day. */
  async importRoster(records) {
    const { data } = await httpClient.post(`${this.resourcePath}/import`, { records });
    return data; // { success, data: { created, failed } }
  }

  /** `period` is 'day' | 'week' | 'month' (default 'day'); `date` defaults to today. */
  async getStats({ period, date } = {}) {
    const { data } = await httpClient.get(`${this.resourcePath}/stats`, { params: { period, date } });
    return data; // { success, data: { period, start, end, totalTeamCount, counts } }
  }

  /**
   * The Monday-Sunday week containing `date` (default today) -- feeds
   * TeamShiftsGrid.jsx's Shifts-style schedule view. `date` defaults to
   * today, same as getStats above.
   */
  async getWeeklySchedule({ date } = {}) {
    const { data } = await httpClient.get(`${this.resourcePath}/schedule`, { params: { date } });
    return data; // { success, data: { start, end, entries: [{ _id, member: { _id, name }, date, support, shift, timeSlot }] } }
  }
}

export default new TeamRosterApiService();
