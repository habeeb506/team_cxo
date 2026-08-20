import { Holiday } from '../../src/models/index.js';

// A standard 2026 corporate holiday calendar. `day` isn't set here --
// Holiday.model.js derives it from `date` in a pre-validate hook, so it
// can never drift out of sync with the actual calendar date. Consumed
// by utils/businessTime.js (via TaskService's attachCompletionTimeliness)
// to exclude these dates, alongside Saturdays/Sundays, when measuring
// how late a completed task was against its due date.
const HOLIDAYS_2026 = [
  { occasion: "New Year's Day", date: '2026-01-01' },
  { occasion: 'Martin Luther King Jr. Day', date: '2026-01-19' },
  { occasion: "Presidents' Day", date: '2026-02-16' },
  { occasion: 'Memorial Day', date: '2026-05-25' },
  { occasion: 'Juneteenth', date: '2026-06-19' },
  { occasion: 'Independence Day (observed)', date: '2026-07-03' },
  { occasion: 'Labor Day', date: '2026-09-07' },
  { occasion: 'Columbus Day', date: '2026-10-12' },
  { occasion: 'Veterans Day', date: '2026-11-11' },
  { occasion: 'Thanksgiving Day', date: '2026-11-26' },
  { occasion: 'Day After Thanksgiving', date: '2026-11-27' },
  { occasion: 'Christmas Day', date: '2026-12-25' },
];

/** Seeds the year's holiday calendar (see HOLIDAYS_2026 above). */
export async function seedHolidays() {
  return Holiday.insertMany(HOLIDAYS_2026);
}
