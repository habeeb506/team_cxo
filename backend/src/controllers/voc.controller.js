import { HTTP_STATUS } from '../config/constants.js';
import VocService from '../services/VocService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { buildListQueryOptions } from '../utils/queryOptions.js';

import { createCrudController } from './baseController.js';

const vocService = new VocService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/voc.routes.js), same "display only" scope as tickets.
// `dateRangeField: 'receivedAt'` backs the Year/Month filter.
const crud = createCrudController(vocService, {
  allowedFilters: ['assignedTo', 'category'],
  searchableFields: ['customerName', 'feedback'],
  dateRangeField: 'receivedAt',
});

const vocController = {
  ...crud,

  // GET /vocs/mine -- backs the Dashboard's Individual Contribution
  // "VOCs" tab. `assignedTo` is forced to the verified session's user
  // id (req.user, set by middlewares/auth.middleware.js) -- see
  // ticket.controller.js's getMine for why any client-supplied
  // `assignedTo` is ignored here.
  getMine: asyncHandler(async (req, res) => {
    const { page, limit, sort, filter } = buildListQueryOptions(req.query, {
      searchableFields: ['customerName', 'feedback'],
      dateRangeField: 'receivedAt',
    });
    filter.assignedTo = req.user.id;
    const { data, pagination } = await vocService.list({ page, limit, sort, filter });
    sendSuccess(res, HTTP_STATUS.OK, data, { pagination });
  }),
};

export default vocController;
