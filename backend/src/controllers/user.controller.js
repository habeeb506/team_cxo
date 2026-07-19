import { HTTP_STATUS } from '../config/constants.js';
import UserService from '../services/UserService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

import { createCrudController } from './baseController.js';

const userService = new UserService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/user.routes.js), just `getAll`/`getById` reused as-is
// from the generic CRUD controller since their logic (list/fetch-or-404)
// is identical to any other resource's. `getAll` backs pages/TasksPage.jsx's
// assignee picker (the full roster, not just the demo-account subset).
const crud = createCrudController(userService, {
  allowedFilters: [],
  searchableFields: ['name', 'email'],
});

const userController = {
  getAll: crud.getAll,
  getById: crud.getById,

  // GET /users/demo-accounts -- the fixed subset of seeded users
  // offered in the frontend's mock "logged in as" switcher.
  getDemoAccounts: asyncHandler(async (_req, res) => {
    const accounts = await userService.getDemoAccounts();
    sendSuccess(res, HTTP_STATUS.OK, accounts);
  }),
};

export default userController;
