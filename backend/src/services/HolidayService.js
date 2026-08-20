import HolidayRepository from '../repositories/HolidayRepository.js';

import BaseService from './BaseService.js';

class HolidayService extends BaseService {
  constructor() {
    super(new HolidayRepository(), 'Holiday');
  }
}

export default HolidayService;
