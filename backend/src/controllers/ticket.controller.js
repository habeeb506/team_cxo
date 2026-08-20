import { HTTP_STATUS } from '../config/constants.js';
import TicketService from '../services/TicketService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { buildListQueryOptions } from '../utils/queryOptions.js';

import { createCrudController } from './baseController.js';

const ticketService = new TicketService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/ticket.routes.js). `assignedTo` remains an allowed
// filter for `getAll` since the Team Members-style internal views are
// fine showing anyone's tickets to any authenticated user (see
// ARCHITECTURE.md's auth notes for why that's in scope today and
// per-role restriction isn't yet). `dateRangeField: 'createdAt'` backs
// the Year/Month filter (see utils/queryOptions.js).
const crud = createCrudController(ticketService, {
  allowedFilters: ['assignedTo', 'status', 'priority'],
  searchableFields: ['title'],
  dateRangeField: 'createdAt',
});

const ticketController = {
  ...crud,

  // GET /tickets/mine -- backs the Dashboard's Individual Contribution
  // panel. `assignedTo` is forced to the verified session's user id
  // (req.user, set by middlewares/auth.middleware.js) and any
  // client-supplied `assignedTo` is ignored -- this is what makes "my
  // tickets" trustworthy. Before this endpoint existed, the panel asked
  // for `GET /tickets?assignedTo=<id>` using whichever id the frontend's
  // mock "logged in as" switcher happened to have locally, which meant
  // any browser could read any other user's tickets just by changing
  // that id client-side.
  getMine: asyncHandler(async (req, res) => {
    const { page, limit, sort, filter } = buildListQueryOptions(req.query, {
      searchableFields: ['title'],
      dateRangeField: 'createdAt',
    });
    filter.assignedTo = req.user.id;
    const { data, pagination } = await ticketService.list({ page, limit, sort, filter });
    sendSuccess(res, HTTP_STATUS.OK, data, { pagination });
  }),
};

export default ticketController;
