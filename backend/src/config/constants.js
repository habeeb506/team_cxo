/**
 * App-wide constants that don't belong in environment variables.
 * Centralized here so feature modules never hardcode magic values.
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

/** Shared email validator used by every schema/collection with an emailId field. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Employment status for cxo_teams records. */
export const TEAM_MEMBER_STATUS = ['active', 'inactive', 'on-leave', 'terminated'];

/**
 * Allowed permission actions for cxo_permissions. Adding a new
 * permission type (e.g. 'approve', 'export', 'archive') is a one-line
 * addition here — the schema itself never changes.
 */
export const PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete'];

/**
 * App roles for the `users` collection, driving the role-based
 * dashboard. Real authentication doesn't exist yet (see
 * ARCHITECTURE.md's "Suggested improvements") -- until then, `users`
 * are dummy accounts and the frontend's mock "logged in as" switcher
 * (context/CurrentUserContext.jsx) is how a role is selected for
 * testing. When real auth arrives, this becomes the actual role list.
 */
export const USER_ROLES = ['admin', 'manager', 'employee'];

/** Status values for the `tickets` collection. */
export const TICKET_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

/** Priority values shared by tickets and tasks. */
export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'];

/** Status values for the `tasks` collection. */
export const TASK_STATUSES = ['todo', 'in-progress', 'done'];
