import TicketRepository from '../repositories/TicketRepository.js';

import BaseService from './BaseService.js';

class TicketService extends BaseService {
  constructor() {
    super(new TicketRepository(), 'Ticket');
  }
}

export default TicketService;
