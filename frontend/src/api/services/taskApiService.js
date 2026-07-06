import ApiService from '../baseApiService.js';

/** Read-only for now (see CONTRIBUTING.md's "Admin UI scope" note). */
class TaskApiService extends ApiService {
  constructor() {
    super('/v1/tasks');
  }
}

export default new TaskApiService();
