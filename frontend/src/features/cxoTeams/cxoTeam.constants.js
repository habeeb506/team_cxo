/**
 * Mirrors backend/src/config/constants.js TEAM_MEMBER_SUPPORT_TYPES.
 * Frontend and backend are separate packages, so this stays in sync
 * manually -- if the backend enum changes, update this list too.
 *
 * `support` is a daily roster-status value (driven by the monthly team
 * roster upload -- see features/cxoTeams/useTeamRosterUpload.js).
 * 'available' is the everyday, nothing-special-to-report state (the
 * common case, and this field's default); 'training'/'reconciliation'/
 * 'mfa'/'dlaunch' are named special-task assignments outside a person's
 * normal queue; 'pto'/'epto' cover a person being off (regular Paid Time
 * Off vs. emergency/short-notice ePTO); and 'other' is the catch-all for
 * anything that isn't one of those six. Every value is paired with a
 * free-text `timeSlot` (e.g. "9:00 AM - 1:00 PM" or "Full day") it
 * applies to -- see CXO_TEAM_FIELDS in cxoTeam.management.config.jsx.
 */
export const CXO_TEAM_SUPPORT_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'training', label: 'Training' },
  { value: 'reconciliation', label: 'Reconciliation' },
  { value: 'mfa', label: 'MFA' },
  { value: 'dlaunch', label: 'Dlaunch' },
  { value: 'pto', label: 'PTO' },
  { value: 'epto', label: 'ePTO' },
  { value: 'other', label: 'Other' },
];
