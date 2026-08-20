import { HTTP_STATUS } from '../config/constants.js';
import TaskService from '../services/TaskService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { buildListQueryOptions } from '../utils/queryOptions.js';

import { createCrudController } from './baseController.js';

const taskService = new TaskService();

// Full CRUD -- pages/TasksPage.jsx creates/edits/deletes tasks and
// assigns them to a `users` roster member (see routes/v1/task.routes.js).
// `assignedTo` also doubles as the filter that view uses to scope to
// any given person; `dateRangeField: 'createdAt'` backs its Year/Month
// filter (see utils/queryOptions.js). See `getMine` below for the
// Dashboard's own-tasks widgets, which never trust a client-supplied
// `assignedTo`.
const crud = createCrudController(taskService, {
  allowedFilters: ['assignedTo', 'status', 'priority'],
  searchableFields: ['title'],
  dateRangeField: 'createdAt',
});

const taskController = {
  ...crud,

  // GET /tasks/mine -- backs the Dashboard's Open Tasks and Individual
  // Contribution panels. `assignedTo` is forced to the verified
  // session's user id (req.user, set by middlewares/auth.middleware.js)
  // regardless of anything the client sends -- see
  // ticket.controller.js's getMine for why this matters.
  getMine: asyncHandler(async (req, res) => {
    const { page, limit, sort, filter } = buildListQueryOptions(req.query, {
      searchableFields: ['title'],
      dateRangeField: 'createdAt',
    });
    filter.assignedTo = req.user.id;
    const { data, pagination } = await taskService.list({ page, limit, sort, filter });
    sendSuccess(res, HTTP_STATUS.OK, data, { pagination });
  }),
};

export default taskController;
