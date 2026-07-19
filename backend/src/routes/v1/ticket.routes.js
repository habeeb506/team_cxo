import { Router } from 'express';
import { z } from 'zod';

import ticketController from '../../controllers/ticket.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { paginationQuerySchema, yearMonthQueryShape } from '../../validations/index.js';

const router = Router();

// Extends the standard pagination query with the optional Year/Month
// filter (see utils/queryOptions.js's dateRangeField, wired to
// `createdAt` in ticket.controller.js).
const ticketListQuerySchema = z.object({
  query: paginationQuerySchema.shape.query.extend(yearMonthQueryShape),
});

// GET only -- see CONTRIBUTING.md's "Admin UI scope" note. Callers
// scope to a person via ?assignedTo=<userId>.
router.get('/', validateRequest(ticketListQuerySchema), ticketController.getAll);

export default router;
