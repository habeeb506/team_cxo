import { Router } from 'express';

import teamRosterController from '../../controllers/teamRoster.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import {
  teamRosterImportSchema,
  teamRosterStatsQuerySchema,
  teamRosterScheduleQuerySchema,
} from '../../validations/index.js';

const router = Router();

router.post('/import', validateRequest(teamRosterImportSchema), teamRosterController.import);
router.get('/stats', validateRequest(teamRosterStatsQuerySchema), teamRosterController.getStats);
router.get(
  '/schedule',
  validateRequest(teamRosterScheduleQuerySchema),
  teamRosterController.getWeeklySchedule,
);

export default router;
