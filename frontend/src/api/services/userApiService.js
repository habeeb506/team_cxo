import ApiService from '../baseApiService.js';

/**
 * `users` is read-only on the frontend for now (see CONTRIBUTING.md's
 * "Read-only resources" note) -- `getAll` (inherited) backs
 * pages/TasksPage.jsx's assignee picker, and `getById` (also inherited)
 * covers any future single-record lookup. Login itself goes through
 * api/services/authApiService.js, not this class.
 */
class UserApiService extends ApiService {
  constructor() {
    super('/v1/users');
  }
}

export default new UserApiService();
