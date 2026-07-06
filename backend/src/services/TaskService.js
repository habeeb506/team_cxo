import TaskRepository from '../repositories/TaskRepository.js';

import BaseService from './BaseService.js';

class TaskService extends BaseService {
  constructor() {
    super(new TaskRepository(), 'Task');
  }
}

export default TaskService;
