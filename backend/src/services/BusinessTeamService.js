import BusinessTeamRepository from '../repositories/BusinessTeamRepository.js';
import { businessTeamBodySchema } from '../validations/businessTeam.schema.js';

import BaseService from './BaseService.js';

class BusinessTeamService extends BaseService {
  constructor() {
    super(new BusinessTeamRepository(), 'Business team member', {
      uniqueFields: ['emailId'],
      bodySchema: businessTeamBodySchema,
    });
  }
}

export default BusinessTeamService;
