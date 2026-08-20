import HolidayService from '../services/HolidayService.js';

import { createCrudController } from './baseController.js';

const holidayService = new HolidayService();

// Read-only -- no create/update/delete routes are registered (see
// routes/v1/holiday.routes.js). Not scoped to a user (no `getMine`),
// unlike tickets/tasks -- the holiday calendar is the same for
// everyone, so there's nothing to filter by "mine". `dateRangeField:
// 'date'` lets a caller narrow to a specific year/month the same way
// tickets/tasks do, though the frontend currently just fetches the
// whole calendar for its business-day math -- see
// utils/businessTime.js and TaskService.js's `attachCompletionTimeliness`.
const holidayController = createCrudController(holidayService, {
  searchableFields: ['occasion'],
  dateRangeField: 'date',
});

export default holidayController;
