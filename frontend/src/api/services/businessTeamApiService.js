import ApiService from '../baseApiService.js';

class BusinessTeamApiService extends ApiService {
  constructor() {
    super('/v1/business-teams');
  }
}

export default new BusinessTeamApiService();
