import ApiService from '../baseApiService.js';

/** Read-only for now (see CONTRIBUTING.md's "Admin UI scope" note). */
class TicketApiService extends ApiService {
  constructor() {
    super('/v1/tickets');
  }
}

export default new TicketApiService();
