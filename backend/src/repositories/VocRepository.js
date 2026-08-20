import { Voc } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class VocRepository extends BaseRepository {
  constructor() {
    super(Voc);
  }
}

export default VocRepository;
