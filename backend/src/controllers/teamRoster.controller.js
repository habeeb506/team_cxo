import { HTTP_STATUS } from '../config/constants.js';
import TeamRosterService from '../services/TeamRosterService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

const teamRosterService = new TeamRosterService();

/**
 * Not a `createCrudController` resource -- the roster has exactly two
 * operations a client needs (upload a month, read the stats bar), not a
 * paginated list/detail/edit/delete surface, so this is hand-written
 * the same way holiday.controller.js's read-only shape is, just with a
 * write endpoint instead.
 */
const teamRosterController = {
  // POST /team-roster/import  { records: [{ email, date, support, shift? }] }
  import: asyncHandler(async (req, res) => {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      throw ApiError.badRequest('records must be a non-empty array');
    }
    const result = await teamRosterService.importRoster(records);
    sendSuccess(res, HTTP_STATUS.OK, result);
  }),

  // GET /team-roster/stats?period=day|week|month&date=YYYY-MM-DD
  getStats: asyncHandler(async (req, res) => {
    const { period, date } = req.query;
    const stats = await teamRosterService.getStats({ period, date });
    sendSuccess(res, HTTP_STATUS.OK, stats);
  }),

  // GET /team-roster/schedule?date=YYYY-MM-DD -- the Monday-Sunday week
  // containing `date` (default today), for the Shifts-style schedule grid.
  getWeeklySchedule: asyncHandler(async (req, res) => {
    const { date } = req.query;
    const schedule = await teamRosterService.getWeeklySchedule({ date });
    sendSuccess(res, HTTP_STATUS.OK, schedule);
  }),
};

export default teamRosterController;
