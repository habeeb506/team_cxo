import CxoTeamRepository from '../repositories/CxoTeamRepository.js';
import { cxoTeamBodySchema } from '../validations/cxoTeam.schema.js';
import ApiError from '../utils/ApiError.js';
import { yearsBetween } from '../utils/experience.js';

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
  // CxoPermissionService uses for `member`. Also attaches the computed
  // experience fields (see attachExperienceFields) so the frontend never
  // has to duplicate the tenure math itself.
  async list(queryOptions) {
    const result = await this.repository.findMany(queryOptions?.filter, {
      ...queryOptions,
      populate: LEAD_MANAGER_POPULATE,
    });
    return { ...result, data: this.attachExperienceFields(result.data) };
  }

  async getById(id) {
    const doc = await this.repository.findById(id, { populate: LEAD_MANAGER_POPULATE });
    if (!doc) throw ApiError.notFound(`${this.resourceName} not found`);
    const [withExperience] = this.attachExperienceFields([doc]);
    return withExperience;
  }

  /**
   * Adds three computed, never-persisted fields to each member (see
   * CxoTeam.model.js's docblock for why they aren't stored):
   *  - firmExperience: years since `joiningDate`.
   *  - overallExperience: `priorExperience` (years before this firm,
   *    0 if unset) plus firmExperience.
   *  - timeInRole: years since `lastPromotionDate`, or since
   *    `joiningDate` if this person has never been promoted -- "time in
   *    role" always means "time since the role they're in today
   *    started", not "time since the last promotion specifically" for
   *    someone who's never had one.
   * Pure/synchronous (unlike TaskService.attachCompletionTimeliness,
   * which needs the holiday calendar) -- no extra query needed here.
   */
  attachExperienceFields(docs) {
    return docs.map((doc) => {
      const plain = doc.toObject ? doc.toObject() : doc;
      const firmExperience = yearsBetween(plain.joiningDate);
      const overallExperience = Math.round(((plain.priorExperience || 0) + firmExperience) * 10) / 10;
      const timeInRole = yearsBetween(plain.lastPromotionDate || plain.joiningDate);
      return { ...plain, firmExperience, overallExperience, timeInRole };
    });
  }
}

export default CxoTeamService;
