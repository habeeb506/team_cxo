import CxoTeamService from '../services/CxoTeamService.js';

import { createCrudController } from './baseController.js';

const cxoTeamService = new CxoTeamService();

// GET /cxo-teams?support=training&group=Engineering&search=jane
const cxoTeamController = createCrudController(cxoTeamService, {
  allowedFilters: ['support', 'group', 'level', 'location', 'lead', 'manager'],
  searchableFields: ['name', 'designation', 'emailId'],
});

export default cxoTeamController;
