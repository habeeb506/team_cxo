import { Appointment } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class AppointmentRepository extends BaseRepository {
  constructor() {
    super(Appointment);
  }
}

export default AppointmentRepository;
