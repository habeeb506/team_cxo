import TaskRepository from '../repositories/TaskRepository.js';
import HolidayRepository from '../repositories/HolidayRepository.js';
import { taskBodySchema } from '../validations/task.schema.js';
import ApiError from '../utils/ApiError.js';
import { classifyCompletionTimeliness } from '../utils/businessTime.js';

import BaseService from './BaseService.js';

// Only the fields the Tasks table/detail view need from the assignee --
// not the full User document.
const ASSIGNEE_POPULATE = { path: 'assignedTo', select: 'name email jobTitle' };

// Holidays collection is small (one year's worth) -- a single query
// comfortably covers it without a dedicated "find all" repository method.
const MAX_HOLIDAYS = 1000;

class TaskService extends BaseService {
  constructor() {
    super(new TaskRepository(), 'Task', { bodySchema: taskBodySchema });
    // Direct repository dependency, not the usual one-service-owns-one-
    // repository pattern every other service follows -- this is a
    // narrow, documented exception. A full HolidayService adds nothing
    // here: attachCompletionTimeliness below only needs a read-only list
    // of holiday calendar dates, not any holiday CRUD/authorization
    // logic a real HolidayService would exist to own.
    this.holidayRepository = new HolidayRepository();
  }

  // Overridden so every list/detail view shows the assignee's name
  // instead of a raw ObjectId -- same "override only what's different"
  // extension point CxoPermissionService uses for `member`. Also attaches
  // completionTimeliness (see attachCompletionTimeliness) so the frontend
  // can color a done task's status without duplicating the delay math.
  async list(queryOptions) {
    const result = await this.repository.findMany(queryOptions?.filter, {
      ...queryOptions,
      populate: ASSIGNEE_POPULATE,
    });
    return { ...result, data: await this.attachCompletionTimeliness(result.data) };
  }

  async getById(id) {
    const doc = await this.repository.findById(id, { populate: ASSIGNEE_POPULATE });
    if (!doc) throw ApiError.notFound(`${this.resourceName} not found`);
    const [withTimeliness] = await this.attachCompletionTimeliness([doc]);
    return withTimeliness;
  }

  /**
   * Adds a computed `completionTimeliness` field ('on-time' | 'delayed'
   * | 'overdue' | null -- see utils/businessTime.js's
   * classifyCompletionTimeliness) to each task, so a done task's status
   * badge can be colored green/yellow/red on the frontend without it
   * re-implementing the weekend/holiday-aware delay calculation itself.
   * Fetches the holiday calendar fresh on every call instead of caching
   * it in memory -- the holidays collection is small and effectively
   * read-only from the app's perspective, so the extra query is cheap
   * and this can never serve a stale calendar after a Holiday document
   * changes.
   */
  async attachCompletionTimeliness(docs) {
    if (docs.length === 0) return docs;
    const { data: holidays } = await this.holidayRepository.findMany({}, { limit: MAX_HOLIDAYS });
    const holidayDates = holidays.map((holiday) => holiday.date);
    return docs.map((doc) => {
      const plain = doc.toObject ? doc.toObject() : doc;
      return { ...plain, completionTimeliness: classifyCompletionTimeliness(plain, holidayDates) };
    });
  }

  // Overridden so `completedAt` is always a server-derived fact, never
  // a client-supplied one -- whenever an update carries a `status`
  // change, this stamps `completedAt` to the system date/time the
  // moment it becomes 'done', and clears it if the status moves away
  // from 'done' again (e.g. reopened by mistake). Applies uniformly to
  // every caller of `PATCH /tasks/:id` -- the Tasks admin page's edit
  // form and the Dashboard's quick status-edit control (see
  // hooks/useTaskStatusUpdate.js) both go through this same path, so
  // neither can send a fabricated completion timestamp even if it
  // tried (taskBodySchema doesn't define a `completedAt` field at all,
  // so zod strips it from the request body before it ever reaches here).
  async update(id, data) {
    const nextData = { ...data };
    if (nextData.status !== undefined) {
      nextData.completedAt = nextData.status === 'done' ? new Date() : null;
    }
    return super.update(id, nextData);
  }
}

export default TaskService;
