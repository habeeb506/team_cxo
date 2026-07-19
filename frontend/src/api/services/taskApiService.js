import ApiService from '../baseApiService.js';

/**
 * Full CRUD (see pages/TasksPage.jsx) -- inherits create/update/remove/
 * bulkImport/bulkDelete from ApiService with no overrides needed.
 */
class TaskApiService extends ApiService {
  constructor() {
    super('/v1/tasks');
  }
}

export default new TaskApiService();
