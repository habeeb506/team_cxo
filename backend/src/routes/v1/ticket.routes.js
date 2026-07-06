import { Router } from 'express';

import ticketController from '../../controllers/ticket.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { paginationQuerySchema } from '../../validations/index.js';

const router = Router();

// GET only -- see CONTRIBUTING.md's "Admin UI scope" note. Callers
// scope to a person via ?assignedTo=<userId>.
router.get('/', validateRequest(paginationQuerySchema), ticketController.getAll);

export default router;
