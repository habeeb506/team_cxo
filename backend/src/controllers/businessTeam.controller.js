import BusinessTeamService from '../services/BusinessTeamService.js';

import { createCrudController } from './baseController.js';

const businessTeamService = new BusinessTeamService();

// GET /business-teams?business=Payments&location=Bangalore&search=jane
const businessTeamController = createCrudController(businessTeamService, {
  allowedFilters: ['business', 'location'],
  searchableFields: ['name', 'emailId', 'business'],
});

export default businessTeamController;
