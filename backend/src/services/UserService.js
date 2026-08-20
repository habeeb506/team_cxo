import UserRepository from '../repositories/UserRepository.js';

import BaseService from './BaseService.js';

class UserService extends BaseService {
  constructor() {
    super(new UserRepository(), 'User', { uniqueFields: ['email'] });
  }

  /** Looks up a user by email for OTP login (see services/AuthService.js). */
  async getByEmail(email) {
    return this.repository.findByEmail(email);
  }
}

export default UserService;
