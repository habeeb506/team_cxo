import { HTTP_STATUS } from '../config/constants.js';
import LeaderboardService from '../services/LeaderboardService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const leaderboardService = new LeaderboardService();

// Custom, not createCrudController -- a leaderboard snapshot isn't a
// plain paginated CRUD list (see LeaderboardEntry.model.js and
// LeaderboardService.js for why rank is computed, not stored).
const leaderboardController = {
  // GET /leaderboard/entries?date=YYYY-MM-DD
  // or  /leaderboard/entries?years=2024,2025&months=1,3 (see getEntriesForPeriod)
  getEntries: asyncHandler(async (req, res) => {
    const { date, years, months } = req.query;
    const result = await leaderboardService.getEntriesForPeriod({ date, years, months });
    sendSuccess(res, HTTP_STATUS.OK, result.entries, { date: result.date });
  }),

  // GET /leaderboard/dates -- populates the panel's date picker.
  getDates: asyncHandler(async (_req, res) => {
    const dates = await leaderboardService.getAvailableDates();
    sendSuccess(res, HTTP_STATUS.OK, dates);
  }),
};

export default leaderboardController;
