import { Holiday } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class HolidayRepository extends BaseRepository {
  constructor() {
    super(Holiday);
  }
}

export default HolidayRepository;
