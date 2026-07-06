import UserRepository from '../repositories/UserRepository.js';

import BaseService from './BaseService.js';

class UserService extends BaseService {
  constructor() {
    super(new UserRepository(), 'User', { uniqueFields: ['email'] });
  }

  /** Users offered in the frontend's mock "logged in as" switcher. */
  async getDemoAccounts() {
    return this.repository.findDemoAccounts();
  }
}

export default UserService;
