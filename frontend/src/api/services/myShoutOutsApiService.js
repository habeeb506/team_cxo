import ApiService from '../baseApiService.js';

/**
 * The Dashboard's Individual Contribution panel hits
 * `GET /shout-outs/mine` instead of `GET /shout-outs?assignedTo=<id>`
 * -- see api/services/myTasksApiService.js's docblock for why (same
 * reasoning, backed by backend/src/controllers/shoutOut.controller.js's
 * getMine).
 */
class MyShoutOutsApiService extends ApiService {
  constructor() {
    super('/v1/shout-outs/mine');
  }
}

export default new MyShoutOutsApiService();
