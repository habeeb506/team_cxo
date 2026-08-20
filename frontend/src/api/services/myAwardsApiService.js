import ApiService from '../baseApiService.js';

/**
 * The Dashboard's Individual Contribution panel hits `GET /awards/mine`
 * instead of `GET /awards?assignedTo=<id>` -- see
 * api/services/myTasksApiService.js's docblock for why (same reasoning,
 * backed by backend/src/controllers/award.controller.js's getMine).
 */
class MyAwardsApiService extends ApiService {
  constructor() {
    super('/v1/awards/mine');
  }
}

export default new MyAwardsApiService();
