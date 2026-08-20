import { User } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /** Looks up a user by email for OTP login (see services/AuthService.js). */
  findByEmail(email) {
    return this.model.findOne(this.withDeletedFilter({ email })).exec();
  }
}

export default UserRepository;
