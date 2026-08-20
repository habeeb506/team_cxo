import { ShoutOut } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class ShoutOutRepository extends BaseRepository {
  constructor() {
    super(ShoutOut);
  }
}

export default ShoutOutRepository;
