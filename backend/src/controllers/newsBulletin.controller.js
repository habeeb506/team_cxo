import NewsBulletinService from '../services/NewsBulletinService.js';

import { createCrudController } from './baseController.js';

const newsBulletinService = new NewsBulletinService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/newsBulletin.routes.js).
const newsBulletinController = createCrudController(newsBulletinService, {
  allowedFilters: [],
  searchableFields: ['title'],
});

export default newsBulletinController;
