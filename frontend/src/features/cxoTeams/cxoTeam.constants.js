/**
 * Mirrors backend/src/config/constants.js TEAM_MEMBER_STATUS. Frontend
 * and backend are separate packages, so this stays in sync manually —
 * if the backend enum changes, update this list too.
 */
export const CXO_TEAM_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
];
