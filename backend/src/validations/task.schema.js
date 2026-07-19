import { z } from 'zod';

import { TASK_STATUSES, PRIORITY_LEVELS } from '../config/constants.js';

import { objectIdSchema } from './common/objectId.schema.js';

/**
 * Body shape for creating/updating a task. `assignedTo` is required --
 * every task needs an owner (see backend/src/models/Task.model.js) --
 * and is validated here as a bare ObjectId string; the frontend's
 * Tasks page resolves that id from a picker built off the `users`
 * roster rather than free-typing it (see pages/TasksPage.jsx).
 */
export const taskBodySchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(PRIORITY_LEVELS).optional(),
  assignedTo: objectIdSchema,
  dueDate: z.coerce.date().nullable().optional(),
});

export const createTaskSchema = z.object({ body: taskBodySchema });

export const updateTaskSchema = z.object({ body: taskBodySchema.partial() });

// CSV import row validation reuses taskBodySchema directly inside
// TaskService (via its `bodySchema` option) -- see
// validations/common/bulkImport.schema.js for the shared route-level
// shape (records: object[], mode: append|replace).
