export { objectIdSchema, objectIdParamSchema } from './common/objectId.schema.js';
export { paginationQuerySchema } from './common/pagination.schema.js';
export { bulkDeleteSchema } from './common/bulkDelete.schema.js';
// Shared by every resource's POST /import route — see the file for why
// per-record shape validation isn't done here (it's per-row, in the
// service layer, so one bad CSV row doesn't reject the whole request).
export { bulkImportSchema } from './common/bulkImport.schema.js';
// Optional ?date=YYYY-MM-DD query param, currently used by the
// leaderboard's point-in-time snapshot endpoint.
export { dateQuerySchema } from './common/dateQuery.schema.js';
// Optional ?year=YYYY&month=M query shape, `.extend()`-ed into a
// resource's own list-query schema (tickets, tasks, leaderboard).
export { yearMonthQueryShape } from './common/yearMonthQuery.schema.js';
export { taskBodySchema, createTaskSchema, updateTaskSchema } from './task.schema.js';
export { createCxoTeamSchema, updateCxoTeamSchema } from './cxoTeam.schema.js';
export { createCxoPermissionSchema, updateCxoPermissionSchema } from './cxoPermission.schema.js';
export { createBusinessTeamSchema, updateBusinessTeamSchema } from './businessTeam.schema.js';

/**
 * Future feature validation schemas register here as they're built.
 */
