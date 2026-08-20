import { toUtcDateOnly } from './date.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DELAY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/**
 * True if `dateOnly` (already normalized to UTC midnight via
 * toUtcDateOnly) is a Saturday, Sunday, or a date present in
 * `holidayDateKeys` (a Set of UTC-midnight timestamps -- see
 * calculateBusinessDelayMs). Both are "non-working days" for the
 * purposes of task-completion timeliness: time that elapses on them
 * never counts against how late a task was.
 */
function isNonWorkingDay(dateOnly, holidayDateKeys) {
  const weekday = dateOnly.getUTCDay();
  if (weekday === 0 || weekday === 6) return true;
  return holidayDateKeys.has(dateOnly.getTime());
}

/**
 * How much of the time between `dueDate` and `completedAt` fell on a
 * working day (not Saturday/Sunday, not a seeded holiday). Returns 0 if
 * `completedAt` is at or before `dueDate` -- there's no delay to
 * measure. Walks day-by-day from `dueDate`'s calendar day through
 * `completedAt`, and for each day that's a working day, adds however
 * much of [dueDate, completedAt] falls within that day (partial on the
 * first and last day, the full 24h on days in between) -- a task that
 * became overdue at 4pm Friday and was finished 9am Monday has only
 * accrued the Friday-4pm-to-midnight segment, since Saturday and Sunday
 * contribute nothing.
 *
 * `holidayDates` is a plain array of Date/ISO-string holiday dates
 * (typically every Holiday.date in the seeded calendar) -- callers
 * don't need to pre-sort or pre-filter it.
 */
export function calculateBusinessDelayMs(dueDate, completedAt, holidayDates = []) {
  const due = new Date(dueDate);
  const completed = new Date(completedAt);
  if (Number.isNaN(due.getTime()) || Number.isNaN(completed.getTime())) return 0;
  if (completed <= due) return 0;

  const holidayDateKeys = new Set(holidayDates.map((holidayDate) => toUtcDateOnly(holidayDate).getTime()));

  let delayMs = 0;
  let currentDay = toUtcDateOnly(due);

  while (currentDay.getTime() < completed.getTime()) {
    const nextDay = new Date(currentDay.getTime() + MS_PER_DAY);
    const segmentStart = due > currentDay ? due : currentDay;
    const segmentEnd = completed < nextDay ? completed : nextDay;

    if (segmentEnd > segmentStart && !isNonWorkingDay(currentDay, holidayDateKeys)) {
      delayMs += segmentEnd.getTime() - segmentStart.getTime();
    }

    currentDay = nextDay;
  }

  return delayMs;
}

/**
 * Classifies how timely a completed task's `completedAt` was against
 * its `dueDate`, ignoring weekends and seeded holidays:
 *   - null       -- not applicable (not done, or missing dueDate/completedAt)
 *   - 'on-time'  -- completed at or before the due date/time
 *   - 'delayed'  -- completed late, but within 24 business hours of it
 *   - 'overdue'  -- completed more than 24 business hours late
 *
 * `task` only needs `status`/`dueDate`/`completedAt` -- callers pass a
 * full Task document/plain object and only those three fields are read.
 * `holidayDates` is forwarded as-is to calculateBusinessDelayMs.
 */
export function classifyCompletionTimeliness(task, holidayDates = []) {
  const { status, dueDate, completedAt } = task ?? {};
  if (status !== 'done' || !dueDate || !completedAt) return null;

  const due = new Date(dueDate);
  const completed = new Date(completedAt);
  if (Number.isNaN(due.getTime()) || Number.isNaN(completed.getTime())) return null;
  if (completed <= due) return 'on-time';

  const delayMs = calculateBusinessDelayMs(due, completed, holidayDates);
  return delayMs <= DELAY_THRESHOLD_MS ? 'delayed' : 'overdue';
}
