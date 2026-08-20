import { HTTP_STATUS } from '../config/constants.js';
import ShoutOutService from '../services/ShoutOutService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { buildListQueryOptions } from '../utils/queryOptions.js';

import { createCrudController } from './baseController.js';

const shoutOutService = new ShoutOutService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/shoutOut.routes.js), same "display only" scope as
// tickets. `dateRangeField: 'givenAt'` backs the Year/Month filter.
const crud = createCrudController(shoutOutService, {
  allowedFilters: ['assignedTo'],
  searchableFields: ['fromName', 'message'],
  dateRangeField: 'givenAt',
});

const shoutOutController = {
  ...crud,

  // GET /shout-outs/mine -- backs the Dashboard's Individual
  // Contribution "Shout-outs" tab. `assignedTo` is forced to the
  // verified session's user id (req.user, set by
  // middlewares/auth.middleware.js) -- see ticket.controller.js's
  // getMine for why any client-supplied `assignedTo` is ignored here.
  getMine: asyncHandler(async (req, res) => {
    const { page, limit, sort, filter } = buildListQueryOptions(req.query, {
      searchableFields: ['fromName', 'message'],
      dateRangeField: 'givenAt',
    });
    filter.assignedTo = req.user.id;
    const { data, pagination } = await shoutOutService.list({ page, limit, sort, filter });
    sendSuccess(res, HTTP_STATUS.OK, data, { pagination });
  }),
};

export default shoutOutController;
