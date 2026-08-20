import { HTTP_STATUS } from '../config/constants.js';
import AwardService from '../services/AwardService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { buildListQueryOptions } from '../utils/queryOptions.js';

import { createCrudController } from './baseController.js';

const awardService = new AwardService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/award.routes.js), same "display only" scope as
// tickets. `dateRangeField: 'awardedAt'` backs the Year/Month filter.
const crud = createCrudController(awardService, {
  allowedFilters: ['assignedTo'],
  searchableFields: ['title', 'category'],
  dateRangeField: 'awardedAt',
});

const awardController = {
  ...crud,

  // GET /awards/mine -- backs the Dashboard's Individual Contribution
  // "Awards" tab. `assignedTo` is forced to the verified session's
  // user id (req.user, set by middlewares/auth.middleware.js) -- see
  // ticket.controller.js's getMine for why any client-supplied
  // `assignedTo` is ignored here.
  getMine: asyncHandler(async (req, res) => {
    const { page, limit, sort, filter } = buildListQueryOptions(req.query, {
      searchableFields: ['title', 'category'],
      dateRangeField: 'awardedAt',
    });
    filter.assignedTo = req.user.id;
    const { data, pagination } = await awardService.list({ page, limit, sort, filter });
    sendSuccess(res, HTTP_STATUS.OK, data, { pagination });
  }),
};

export default awardController;
