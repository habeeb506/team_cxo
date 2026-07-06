import NewsBulletinRepository from '../repositories/NewsBulletinRepository.js';

import BaseService from './BaseService.js';

class NewsBulletinService extends BaseService {
  constructor() {
    super(new NewsBulletinRepository(), 'NewsBulletin');
  }
}

export default NewsBulletinService;
