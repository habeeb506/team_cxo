import { Router } from 'express';
import { z } from 'zod';

import vocController from '../../controllers/voc.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { paginationQuerySchema, yearMonthQueryShape } from '../../validations/index.js';

const router = Router();

// Extends the standard pagination query with the optional multi-select
// Year/Month filter (see utils/queryOptions.js's dateRangeField, wired
// to `receivedAt` in voc.controller.js).
const vocListQuerySchema = z.object({
  query: paginationQuerySchema.shape.query.extend(yearMonthQueryShape),
});

// GET only -- see CONTRIBUTING.md's "Read-only resources" note.
router.get('/', validateRequest(vocListQuerySchema), vocController.getAll);
// Scoped server-side to the authenticated session -- see
// voc.controller.js's getMine docblock for why this exists alongside
// the general GET /.
router.get('/mine', validateRequest(vocListQuerySchema), vocController.getMine);

export default router;
