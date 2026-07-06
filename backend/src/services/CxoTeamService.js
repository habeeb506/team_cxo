import CxoTeamRepository from '../repositories/CxoTeamRepository.js';
import { cxoTeamBodySchema } from '../validations/cxoTeam.schema.js';

import BaseService from './BaseService.js';

class CxoTeamService extends BaseService {
  constructor() {
    super(new CxoTeamRepository(), 'Team member', {
      // empIdOld is optional (sparse), so it's only checked when present.
      uniqueFields: ['emailId', 'empIdNew', 'empIdOld'],
      bodySchema: cxoTeamBodySchema,
    });
  }
}

export default CxoTeamService;
