/**
 * Mirrors backend/src/config/constants.js PERMISSION_ACTIONS. Frontend
 * and backend are separate packages, so this stays in sync manually —
 * if the backend enum changes, update this list too.
 */
export const PERMISSION_ACTION_OPTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'read', label: 'Read' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
];

/**
 * `resource` is a free-form string on the backend (new modules register
 * their own resource name without a schema change), but the UI offers
 * the resources that exist today plus a global '*' grant. Add a new
 * module's collection name here when it starts issuing permissions.
 */
export const PERMISSION_RESOURCE_OPTIONS = [
  { value: 'cxo_teams', label: 'Team Members' },
  { value: 'business_teams', label: 'Business Teams' },
  { value: 'cxo_permissions', label: 'Permissions' },
  { value: '*', label: 'All resources' },
];
