import { createCrudController } from './baseController.js';
import UserService from '../services/UserService.js';

const userService = new UserService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/user.routes.js), just `getAll`/`getById` reused as-is
// from the generic CRUD controller since their logic (list/fetch-or-404)
// is identical to any other resource's. `getAll` backs pages/TasksPage.jsx's
// assignee picker (the full roster). Login itself is handled by
// controllers/auth.controller.js, not here.
const crud = createCrudController(userService, {
  allowedFilters: [],
  searchableFields: ['name', 'email'],
});

const userController = {
  getAll: crud.getAll,
  getById: crud.getById,
};

export default userController;
