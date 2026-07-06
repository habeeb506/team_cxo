import CxoTeamService from '../services/CxoTeamService.js';

import { createCrudController } from './baseController.js';

const cxoTeamService = new CxoTeamService();

// GET /cxo-teams?status=active&group=Engineering&search=jane
const cxoTeamController = createCrudController(cxoTeamService, {
  allowedFilters: ['status', 'group', 'level', 'location', 'lead', 'manager'],
  searchableFields: ['name', 'designation', 'emailId'],
});

export default cxoTeamController;
