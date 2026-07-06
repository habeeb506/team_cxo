import CxoPermissionService from '../services/CxoPermissionService.js';

import { createCrudController } from './baseController.js';

const cxoPermissionService = new CxoPermissionService();

// GET /cxo-permissions?member=<id>&resource=cxo_teams
const cxoPermissionController = createCrudController(cxoPermissionService, {
  allowedFilters: ['member', 'resource'],
  searchableFields: ['resource'],
});

export default cxoPermissionController;
