import httpClient from '../httpClient.js';
import ApiService from '../baseApiService.js';

/**
 * `users` is read-only on the frontend for now (see CONTRIBUTING.md's
 * "Admin UI scope" note) -- this subclass only adds the one custom
 * endpoint the mock "logged in as" switcher needs
 * (context/CurrentUserContext.jsx) on top of the inherited getById.
 */
class UserApiService extends ApiService {
  constructor() {
    super('/v1/users');
  }

  /** The fixed subset of seeded users offered in the login switcher. */
  async getDemoAccounts() {
    const { data } = await httpClient.get(`${this.resourcePath}/demo-accounts`);
    return data; // { success, data: User[] }
  }
}

export default new UserApiService();
