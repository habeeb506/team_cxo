import AwardRepository from '../repositories/AwardRepository.js';

import BaseService from './BaseService.js';

class AwardService extends BaseService {
  constructor() {
    super(new AwardRepository(), 'Award');
  }
}

export default AwardService;
