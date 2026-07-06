import { Ticket } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class TicketRepository extends BaseRepository {
  constructor() {
    super(Ticket);
  }
}

export default TicketRepository;
