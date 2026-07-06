import { User } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /** Users offered in the frontend's mock "logged in as" switcher. */
  findDemoAccounts() {
    return this.model
      .find(this.withDeletedFilter({ isDemoAccount: true }))
      .sort('name')
      .exec();
  }
}

export default UserRepository;
