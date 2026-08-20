import { Router } from 'express';
import { z } from 'zod';

import holidayController from '../../controllers/holiday.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { paginationQuerySchema, yearMonthQueryShape } from '../../validations/index.js';

const router = Router();

// Extends the standard pagination query with the optional Year/Month
// filter (see utils/queryOptions.js's dateRangeField, wired to `date`
// in holiday.controller.js).
const holidayListQuerySchema = z.object({
  query: paginationQuerySchema.shape.query.extend(yearMonthQueryShape),
});

// GET only -- read-only for now, see Holiday.model.js's docblock.
router.get('/', validateRequest(holidayListQuerySchema), holidayController.getAll);

export default router;
