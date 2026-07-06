import { Router } from 'express';

import leaderboardController from '../../controllers/leaderboard.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { dateQuerySchema } from '../../validations/index.js';

const router = Router();

// Registered before any future /:id route would be added, and there
// isn't one -- both endpoints here are fixed, not per-record.
router.get('/dates', leaderboardController.getDates);
router.get('/entries', validateRequest(dateQuerySchema), leaderboardController.getEntries);

export default router;
