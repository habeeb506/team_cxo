import ApiService from '../baseApiService.js';

class CxoTeamApiService extends ApiService {
  constructor() {
    super('/v1/cxo-teams');
  }
}

export default new CxoTeamApiService();
