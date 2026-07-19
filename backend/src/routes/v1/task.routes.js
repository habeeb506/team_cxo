import { Router } from 'express';
import { z } from 'zod';

import taskController from '../../controllers/task.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import {
  objectIdParamSchema,
  paginationQuerySchema,
  yearMonthQueryShape,
  createTaskSchema,
  updateTaskSchema,
  bulkImportSchema,
  bulkDeleteSchema,
} from '../../validations/index.js';

const router = Router();

// Extends the standard pagination query with the optional Year/Month
// filter (see utils/queryOptions.js's dateRangeField, wired to
// `createdAt` in task.controller.js).
const taskListQuerySchema = z.object({
  query: paginationQuerySchema.shape.query.extend(yearMonthQueryShape),
});

// Full CRUD (see pages/TasksPage.jsx) -- callers scope the list to one
// person via ?assignedTo=<userId>, same as before.
router.get('/', validateRequest(taskListQuerySchema), taskController.getAll);
router.post('/import', validateRequest(bulkImportSchema), taskController.bulkImport);
router.post('/bulk-delete', validateRequest(bulkDeleteSchema), taskController.bulkRemove);
router.get('/:id', validateRequest(objectIdParamSchema), taskController.getById);
router.post('/', validateRequest(createTaskSchema), taskController.create);
router.patch(
  '/:id',
  validateRequest(objectIdParamSchema),
  validateRequest(updateTaskSchema),
  taskController.update,
);
router.delete('/:id', validateRequest(objectIdParamSchema), taskController.remove);

export default router;
