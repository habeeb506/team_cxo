import { NewsBulletin } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class NewsBulletinRepository extends BaseRepository {
  constructor() {
    super(NewsBulletin);
  }
}

export default NewsBulletinRepository;
