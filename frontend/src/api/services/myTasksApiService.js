import ApiService from '../baseApiService.js';

/**
 * The Dashboard's own-tasks widgets (Open Tasks, Individual Contribution
 * -- see components/dashboard/OpenTasksPanel.jsx and
 * IndividualContributionPanel.jsx) hit `GET /tasks/mine` instead of
 * `GET /tasks?assignedTo=<id>`. The backend resolves "mine" from the
 * verified session, not from any id the client sends (see
 * backend/src/controllers/task.controller.js's getMine) -- pointing
 * resourcePath directly at the `/mine` sub-route means this needs zero
 * method overrides; ApiService.getAll already forwards query params
 * (Year/Month filter) straight through.
 */
class MyTasksApiService extends ApiService {
  constructor() {
    super('/v1/tasks/mine');
  }
}

export default new MyTasksApiService();
