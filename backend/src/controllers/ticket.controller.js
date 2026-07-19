import TicketService from '../services/TicketService.js';

import { createCrudController } from './baseController.js';

const ticketService = new TicketService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/ticket.routes.js). `assignedTo` is the filter the
// Individual Contribution panel uses to scope to the current user;
// `dateRangeField: 'createdAt'` backs its Year/Month filter (see
// utils/queryOptions.js).
const ticketController = createCrudController(ticketService, {
  allowedFilters: ['assignedTo', 'status', 'priority'],
  searchableFields: ['title'],
  dateRangeField: 'createdAt',
});

export default ticketController;
