import ApiService from '../baseApiService.js';

/** Read-only for now (see CONTRIBUTING.md's "Admin UI scope" note). */
class NewsBulletinApiService extends ApiService {
  constructor() {
    super('/v1/news-bulletins');
  }
}

export default new NewsBulletinApiService();
