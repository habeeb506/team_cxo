import { Router } from 'express';

import taskController from '../../controllers/task.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { paginationQuerySchema } from '../../validations/index.js';

const router = Router();

// GET only -- see CONTRIBUTING.md's "Admin UI scope" note. Callers
// scope to a person via ?assignedTo=<userId>.
router.get('/', validateRequest(paginationQuerySchema), taskController.getAll);

export default router;
