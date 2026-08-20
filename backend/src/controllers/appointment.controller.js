import { HTTP_STATUS } from '../config/constants.js';
import AppointmentService from '../services/AppointmentService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { buildListQueryOptions } from '../utils/queryOptions.js';

import { createCrudController } from './baseController.js';

const appointmentService = new AppointmentService();

// Read-only for now -- no create/update/delete routes are registered
// (see routes/v1/appointment.routes.js), same "display only" scope as
// tickets. `dateRangeField: 'scheduledAt'` backs the Year/Month filter.
const crud = createCrudController(appointmentService, {
  allowedFilters: ['assignedTo', 'status'],
  searchableFields: ['title', 'withPerson'],
  dateRangeField: 'scheduledAt',
});

const appointmentController = {
  ...crud,

  // GET /appointments/mine -- backs the Dashboard's Individual
  // Contribution "Appointments" tab. `assignedTo` is forced to the
  // verified session's user id (req.user, set by
  // middlewares/auth.middleware.js) -- see ticket.controller.js's
  // getMine for why any client-supplied `assignedTo` is ignored here.
  getMine: asyncHandler(async (req, res) => {
    const { page, limit, sort, filter } = buildListQueryOptions(req.query, {
      searchableFields: ['title', 'withPerson'],
      dateRangeField: 'scheduledAt',
    });
    filter.assignedTo = req.user.id;
    const { data, pagination } = await appointmentService.list({ page, limit, sort, filter });
    sendSuccess(res, HTTP_STATUS.OK, data, { pagination });
  }),
};

export default appointmentController;
