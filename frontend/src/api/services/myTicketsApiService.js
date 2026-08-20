import ApiService from '../baseApiService.js';

/**
 * The Dashboard's Individual Contribution panel hits `GET /tickets/mine`
 * instead of `GET /tickets?assignedTo=<id>` -- see
 * api/services/myTasksApiService.js's docblock for why (same reasoning,
 * backed by backend/src/controllers/ticket.controller.js's getMine).
 */
class MyTicketsApiService extends ApiService {
  constructor() {
    super('/v1/tickets/mine');
  }
}

export default new MyTicketsApiService();
