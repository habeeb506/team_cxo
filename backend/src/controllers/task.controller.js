import TaskService from '../services/TaskService.js';

import { createCrudController } from './baseController.js';

const taskService = new TaskService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/task.routes.js). `assignedTo` is the filter the
// Individual Contribution panel uses to scope to the current user.
const taskController = createCrudController(taskService, {
  allowedFilters: ['assignedTo', 'status', 'priority'],
  searchableFields: ['title'],
});

export default taskController;
