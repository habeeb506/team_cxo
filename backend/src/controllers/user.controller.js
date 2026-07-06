import { HTTP_STATUS } from '../config/constants.js';
import UserService from '../services/UserService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

import { createCrudController } from './baseController.js';

const userService = new UserService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/user.routes.js). `getById` is reused as-is from the
// generic CRUD controller since its logic (fetch or 404) is identical
// to any other resource's.
const crud = createCrudController(userService, {
  allowedFilters: [],
  searchableFields: ['name', 'email'],
});

const userController = {
  getById: crud.getById,

  // GET /users/demo-accounts -- the fixed subset of seeded users
  // offered in the frontend's mock "logged in as" switcher.
  getDemoAccounts: asyncHandler(async (_req, res) => {
    const accounts = await userService.getDemoAccounts();
    sendSuccess(res, HTTP_STATUS.OK, accounts);
  }),
};

export default userController;
