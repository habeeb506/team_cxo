import ApiService from '../baseApiService.js';

/**
 * The Dashboard's Individual Contribution panel hits `GET /vocs/mine`
 * instead of `GET /vocs?assignedTo=<id>` -- see
 * api/services/myTasksApiService.js's docblock for why (same reasoning,
 * backed by backend/src/controllers/voc.controller.js's getMine).
 */
class MyVocsApiService extends ApiService {
  constructor() {
    super('/v1/vocs/mine');
  }
}

export default new MyVocsApiService();
