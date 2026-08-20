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
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/** Name of the httpOnly cookie carrying the signed session JWT (see utils/jwt.js, middlewares/auth.middleware.js). */
export const AUTH_COOKIE_NAME = 'technet_token';

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

/**
 * Daily roster-status field for cxo_teams records -- by request, renamed
 * from `status` to `support`. `available` is the everyday, nothing-
 * special-to-report state (the common case, and this field's default);
 * `training`/`reconciliation`/`mfa`/`dlaunch` are named special-task
 * assignments outside a person's normal queue; `pto`/`epto` cover a
 * person being off (regular Paid Time Off vs. emergency/short-notice
 * ePTO); and `other` is the catch-all for anything that isn't one of
 * those six. Every uploaded day gets exactly one of these eight values
 * -- there's no "blank"/unset state for a day that *was* reported, only
 * for a member who has never had any roster data uploaded at all (see
 * `TeamRosterEntry.model.js`'s `support` field, still `required`).
 *
 * Driven by the monthly team roster upload (see TeamRosterEntry.model.js,
 * TeamRosterService.importRoster). A member's `support` field always
 * reflects their most recent roster entry; the full day-by-day history
 * lives in `team_roster_entries`, not on the member document itself,
 * which is what makes the roster stats bar (day/week/month counts) and
 * the Shifts-style schedule grid possible. Every entry is paired with a
 * `timeSlot` (see CxoTeam.model.js/TeamRosterEntry.model.js) -- a
 * free-text time range it applies to (e.g. "9:00 AM - 1:00 PM" or "Full
 * day"), the same free-form pattern `shift` already uses.
 */
export const TEAM_MEMBER_SUPPORT_TYPES = [
  'available',
  'training',
  'reconciliation',
  'mfa',
  'dlaunch',
  'pto',
  'epto',
  'other',
];

/**
 * Allowed permission actions for cxo_permissions. Adding a new
 * permission type (e.g. 'approve', 'export', 'archive') is a one-line
 * addition here — the schema itself never changes.
 */
export const PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete'];

/**
 * App roles for the `users` collection, driving the role-based
 * dashboard. Every seeded user logs in for real via email OTP (see
 * routes/v1/auth.routes.js) -- `role` is carried in the signed JWT
 * (see utils/jwt.js) once authenticated. No route currently restricts
 * by role (see ARCHITECTURE.md's "Suggested improvements" -- RBAC
 * enforcement via `cxo_permissions` is the deferred next step); every
 * dashboard section is shown to every authenticated role today.
 */
export const USER_ROLES = ['admin', 'manager', 'employee'];

/** Status values for the `tickets` collection. */
export const TICKET_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

/** Priority values shared by tickets and tasks. */
export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'];

/** Status values for the `tasks` collection. */
export const TASK_STATUSES = ['todo', 'in-progress', 'done'];

/** Status values for the `appointments` collection. */
export const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled'];

/** Category values for the `vocs` (Voice of Customer) collection. */
export const VOC_CATEGORIES = ['praise', 'complaint', 'suggestion'];

/** 1-5 star rating range shared by VOC records. */
export const VOC_RATING_RANGE = { MIN: 1, MAX: 5 };

/** Valid `period` values for GET /team-roster/stats. */
export const TEAM_ROSTER_STATS_PERIODS = ['day', 'week', 'month'];
