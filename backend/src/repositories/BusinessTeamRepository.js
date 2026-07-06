import { BusinessTeam } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class BusinessTeamRepository extends BaseRepository {
  constructor() {
    super(BusinessTeam);
  }
}

export default BusinessTeamRepository;
