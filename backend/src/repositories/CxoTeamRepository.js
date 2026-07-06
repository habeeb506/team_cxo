import { CxoTeam } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class CxoTeamRepository extends BaseRepository {
  constructor() {
    super(CxoTeam);
  }
}

export default CxoTeamRepository;
