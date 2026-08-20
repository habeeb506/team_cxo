import AppointmentRepository from '../repositories/AppointmentRepository.js';

import BaseService from './BaseService.js';

class AppointmentService extends BaseService {
  constructor() {
    super(new AppointmentRepository(), 'Appointment');
  }
}

export default AppointmentService;
