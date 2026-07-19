import TaskService from '../services/TaskService.js';

import { createCrudController } from './baseController.js';

const taskService = new TaskService();

// Full CRUD -- pages/TasksPage.jsx creates/edits/deletes tasks and
// assigns them to a `users` roster member (see routes/v1/task.routes.js).
// `assignedTo` also doubles as the filter the Dashboard's Individual
// Contribution/Open Tasks panels use to scope to the current user;
// `dateRangeField: 'createdAt'` backs their Year/Month filter (see
// utils/queryOptions.js).
const taskController = createCrudController(taskService, {
  allowedFilters: ['assignedTo', 'status', 'priority'],
  searchableFields: ['title'],
  dateRangeField: 'createdAt',
});

export default taskController;
