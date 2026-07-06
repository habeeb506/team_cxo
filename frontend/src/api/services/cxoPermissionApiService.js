import ApiService from '../baseApiService.js';

class CxoPermissionApiService extends ApiService {
  constructor() {
    super('/v1/cxo-permissions');
  }
}

export default new CxoPermissionApiService();
