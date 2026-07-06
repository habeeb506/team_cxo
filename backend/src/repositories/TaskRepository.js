import { Task } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }
}

export default TaskRepository;
