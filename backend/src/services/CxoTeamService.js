import CxoTeamRepository from '../repositories/CxoTeamRepository.js';
import { cxoTeamBodySchema } from '../validations/cxoTeam.schema.js';
import ApiError from '../utils/ApiError.js';

import BaseService from './BaseService.js';

// Only the fields the Team Members table/detail view actually need from
// a member's lead/manager -- not the full referenced document (which
// would otherwise re-include its own lead/manager, etc.).
const LEAD_MANAGER_POPULATE = [
  { path: 'lead', select: 'name emailId designation' },
  { path: 'manager', select: 'name emailId designation' },
];

class CxoTeamService extends BaseService {
  constructor() {
    super(new CxoTeamRepository(), 'Team member', {
      // empIdOld is optional (sparse), so it's only checked when present.
      uniqueFields: ['emailId', 'empIdNew', 'empIdOld'],
      bodySchema: cxoTeamBodySchema,
    });
  }

  // Overridden (rather than plain CRUD defaults) so every list/detail
  // view gets the lead's/manager's name instead of a raw ObjectId --
  // same "override only what's different" extension point
  // CxoPermissionService uses for `member`.
  async list(queryOptions) {
    return this.repository.findMany(queryOptions?.filter, {
      ...queryOptions,
      populate: LEAD_MANAGER_POPULATE,
    });
  }

  async getById(id) {
    const doc = await this.repository.findById(id, { populate: LEAD_MANAGER_POPULATE });
    if (!doc) throw ApiError.notFound(`${this.resourceName} not found`);
    return doc;
  }
}

export default CxoTeamService;
