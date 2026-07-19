import { Router } from 'express';
import { z } from 'zod';

import leaderboardController from '../../controllers/leaderboard.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { dateQuerySchema, yearMonthQueryShape } from '../../validations/index.js';

const router = Router();

// Accepts either a specific ?date=YYYY-MM-DD or a ?year=&month= period
// (the Dashboard's Leaderboard widget uses the latter via its shared
// Year/Month filter -- see LeaderboardService.getEntriesForPeriod).
const leaderboardEntriesQuerySchema = z.object({
  query: dateQuerySchema.shape.query.extend(yearMonthQueryShape),
});

// Registered before any future /:id route would be added, and there
// isn't one -- both endpoints here are fixed, not per-record.
router.get('/dates', leaderboardController.getDates);
router.get('/entries', validateRequest(leaderboardEntriesQuerySchema), leaderboardController.getEntries);

export default router;
