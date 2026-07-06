import CxoPermissionRepository from '../repositories/CxoPermissionRepository.js';
import { cxoPermissionBodySchema } from '../validations/cxoPermission.schema.js';
import ApiError from '../utils/ApiError.js';

import BaseService from './BaseService.js';

class CxoPermissionService extends BaseService {
  constructor() {
    super(new CxoPermissionRepository(), 'Permission grant', {
      // Compound uniqueness: one permission document per member+resource.
      uniqueFields: [['member', 'resource']],
      bodySchema: cxoPermissionBodySchema,
    });
  }

  // Overridden (rather than plain CRUD defaults) so every list/detail
  // view gets the member's name/email instead of a raw ObjectId --
  // this is the "override only what's different" extension point
  // documented on BaseService.
  async list(queryOptions) {
    return this.repository.findMany(queryOptions?.filter, {
      ...queryOptions,
      populate: 'member',
    });
  }

  async getById(id) {
    const doc = await this.repository.findById(id, { populate: 'member' });
    if (!doc) throw ApiError.notFound(`${this.resourceName} not found`);
    return doc;
  }
}

export default CxoPermissionService;
