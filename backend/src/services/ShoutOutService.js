import ShoutOutRepository from '../repositories/ShoutOutRepository.js';

import BaseService from './BaseService.js';

class ShoutOutService extends BaseService {
  constructor() {
    super(new ShoutOutRepository(), 'ShoutOut');
  }
}

export default ShoutOutService;
