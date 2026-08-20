import VocRepository from '../repositories/VocRepository.js';

import BaseService from './BaseService.js';

class VocService extends BaseService {
  constructor() {
    super(new VocRepository(), 'Voc');
  }
}

export default VocService;
