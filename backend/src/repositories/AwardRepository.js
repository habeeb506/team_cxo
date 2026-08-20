import { Award } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class AwardRepository extends BaseRepository {
  constructor() {
    super(Award);
  }
}

export default AwardRepository;
