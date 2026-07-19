import TaskRepository from '../repositories/TaskRepository.js';
import { taskBodySchema } from '../validations/task.schema.js';
import ApiError from '../utils/ApiError.js';

import BaseService from './BaseService.js';

// Only the fields the Tasks table/detail view need from the assignee --
// not the full User document.
const ASSIGNEE_POPULATE = { path: 'assignedTo', select: 'name email jobTitle' };

class TaskService extends BaseService {
  constructor() {
    super(new TaskRepository(), 'Task', { bodySchema: taskBodySchema });
  }

  // Overridden so every list/detail view shows the assignee's name
  // instead of a raw ObjectId -- same "override only what's different"
  // extension point CxoPermissionService uses for `member`.
  async list(queryOptions) {
    return this.repository.findMany(queryOptions?.filter, {
      ...queryOptions,
      populate: ASSIGNEE_POPULATE,
    });
  }

  async getById(id) {
    const doc = await this.repository.findById(id, { populate: ASSIGNEE_POPULATE });
    if (!doc) throw ApiError.notFound(`${this.resourceName} not found`);
    return doc;
  }
}

export default TaskService;
