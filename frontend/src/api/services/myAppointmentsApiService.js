import ApiService from '../baseApiService.js';

/**
 * The Dashboard's Individual Contribution panel hits
 * `GET /appointments/mine` instead of `GET /appointments?assignedTo=<id>`
 * -- see api/services/myTasksApiService.js's docblock for why (same
 * reasoning, backed by backend/src/controllers/appointment.controller.js's
 * getMine).
 */
class MyAppointmentsApiService extends ApiService {
  constructor() {
    super('/v1/appointments/mine');
  }
}

export default new MyAppointmentsApiService();
