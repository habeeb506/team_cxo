import { Router } from 'express';
import { z } from 'zod';

import appointmentController from '../../controllers/appointment.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { paginationQuerySchema, yearMonthQueryShape } from '../../validations/index.js';

const router = Router();

// Extends the standard pagination query with the optional multi-select
// Year/Month filter (see utils/queryOptions.js's dateRangeField, wired
// to `scheduledAt` in appointment.controller.js).
const appointmentListQuerySchema = z.object({
  query: paginationQuerySchema.shape.query.extend(yearMonthQueryShape),
});

// GET only -- see CONTRIBUTING.md's "Read-only resources" note.
router.get('/', validateRequest(appointmentListQuerySchema), appointmentController.getAll);
// Scoped server-side to the authenticated session -- see
// appointment.controller.js's getMine docblock for why this exists
// alongside the general GET /.
router.get('/mine', validateRequest(appointmentListQuerySchema), appointmentController.getMine);

export default router;
