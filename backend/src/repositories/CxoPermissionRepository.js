import { CxoPermission } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class CxoPermissionRepository extends BaseRepository {
  constructor() {
    super(CxoPermission);
  }
}

export default CxoPermissionRepository;
