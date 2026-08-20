import StatusBadge from '../../components/ui/StatusBadge.jsx';

import { CXO_TEAM_SUPPORT_OPTIONS } from './cxoTeam.constants.js';

const supportLabel = (value) => CXO_TEAM_SUPPORT_OPTIONS.find((option) => option.value === value)?.label || value;

/**
 * Table columns for the Team Members management page -- by request,
 * only Name, Location, Place/Floor, Shift, Support, Time Slot are shown
 * here, a much narrower view than the full `cxo_teams` document (see
 * backend/src/models/CxoTeam.model.js). Every other business field
 * (Email Id, Emp Id Old/New, Level, Career Level, Designation, Pic,
 * Lead, Manager, Group, Joining Date, and the full career/development
 * profile block -- Prior/Firm/Overall Experience, Last Promotion, Time
 * In Role, Backup Team Member, Coach, Portfolios, Learning Hours,
 * Business Chemistry, Certifications Planned, CE Baseline, Mobile#)
 * still exists on the record and is still collectible/editable (or, for
 * the three computed ones, viewable) via CXO_TEAM_FIELDS below -- they're
 * just not part of this table's columns. Internal-only fields (isDeleted,
 * deletedAt, createdBy, updatedBy, schemaVersion, metadata, createdAt,
 * updatedAt) were never shown here and still aren't.
 *
 * By request, the exported/imported **CSV template** (CXO_TEAM_EXPORT_FIELDS
 * below) no longer mirrors this table -- it covers the opposite set of
 * fields (every core identity/org field, none of Support/Shift/Time
 * Slot), since those three are roster-driven and belong to the separate
 * Team Roster template instead (see TeamHierarchyPage.jsx's
 * ROSTER_EXPORT_FIELDS).
 *
 * `support` is a daily roster-status value (see cxoTeam.constants.js:
 * Available/Training/Reconciliation/MFA/Dlaunch/PTO/ePTO/Other), kept in sync
 * with each person's most recent team_roster_entries row by the monthly
 * roster upload (see TeamRosterService.syncCurrentSupport). `support`
 * and `timeSlot` are two separate columns (by request), so each reads
 * as its own value rather than a caption stacked under a badge.
 */
export const CXO_TEAM_COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'location', header: 'Location', render: (row) => row.location || '—' },
  { key: 'place', header: 'Place/Floor', render: (row) => row.place || '—' },
  { key: 'shift', header: 'Shift', render: (row) => row.shift || '—' },
  {
    key: 'support',
    header: 'Support',
    render: (row) => (row.support ? <StatusBadge status={row.support} label={supportLabel(row.support)} /> : '—'),
  },
  { key: 'timeSlot', header: 'Time Slot', render: (row) => row.timeSlot || '—' },
];

/** Toolbar filter dropdowns. */
export const CXO_TEAM_FILTERS = [{ name: 'support', label: 'All support', options: CXO_TEAM_SUPPORT_OPTIONS }];

/**
 * Create/edit form + view modal field definitions. Deliberately keeps
 * every business field the table above no longer shows (Email Id, Emp
 * IDs, Level, Designation, Group) -- the table was trimmed for
 * at-a-glance readability, not the underlying record, and `emailId`/
 * `empIdNew` are still required for uniqueness (see CxoTeam.model.js's
 * partial unique indexes) even though they're not surfaced in the list
 * view. `lead`/`manager` are deliberately not editable here (unlike
 * Permissions' `member` field, there's no member-picker wired up for
 * them yet -- they're ObjectId references, not free text, so a plain
 * text input would submit a name string where the backend expects an id
 * and fail validation); `profilePicture` is a raw URL string not worth
 * a dedicated form control yet.
 *
 * `support` is `required` with no blank placeholder -- unlike the old
 * design where "no active assignment" meant a genuinely empty value,
 * `available` is now a normal, selectable option and the field's
 * default (see CxoTeam.model.js), so the Select's first option already
 * covers the common case with no blank/"None" choice needed. `timeSlot`
 * sits right after it since the two are always set together (see
 * cxoTeam.constants.js) -- both are deliberately free-text (mirroring
 * `shift`), not a time-range picker, to keep this already-long form from
 * growing new field-pair widgets. See components/ui/Modal.jsx for how
 * the modal itself scrolls internally instead of overflowing the
 * viewport as this form has grown.
 *
 * By request, this also carries a career/development profile block --
 * added alongside every field already here, not a replacement for any
 * of it. `empIdOld`/`empIdNew` are `type: 'number'` (the backend's
 * `z.coerce.number()` handles the string a native number input actually
 * submits, same coercion pattern `joiningDate`'s `date` input already
 * relies on for `z.coerce.date()`). `overallExperience`,
 * `firmExperience`, and `timeInRole` are `computed: true` -- server-
 * derived, read-only values (see CxoTeamService.attachExperienceFields)
 * that `DynamicFormFields` skips rendering as inputs entirely, but that
 * still show up in the read-only View modal like any other field (see
 * DynamicFormFields.jsx's docblock).
 */
export const CXO_TEAM_FIELDS = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'emailId', label: 'Email Id', type: 'email', required: true },
  { name: 'empIdOld', label: 'Emp Id Old', type: 'number' },
  { name: 'empIdNew', label: 'Emp Id New', type: 'number', required: true },
  { name: 'level', label: 'Level', type: 'text' },
  { name: 'careerLevel', label: 'Career Level', type: 'text' },
  { name: 'designation', label: 'Designation', type: 'text', required: true },
  { name: 'overallExperience', label: 'Over All Experience (yrs)', computed: true },
  { name: 'priorExperience', label: 'Prior Experience (yrs)', type: 'number' },
  { name: 'joiningDate', label: 'Date Of Joining', type: 'date' },
  { name: 'firmExperience', label: 'Firm Experience (yrs)', computed: true },
  { name: 'lastPromotionDate', label: 'Last Promotion', type: 'date' },
  { name: 'timeInRole', label: 'Time In Role (yrs)', computed: true },
  { name: 'backupTeamMember', label: 'Backup Team Member', type: 'text' },
  { name: 'coach', label: 'Coach', type: 'text' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'place', label: 'Place/Floor', type: 'text' },
  { name: 'group', label: 'Group', type: 'text' },
  { name: 'primaryPortfolio', label: 'Primary Portfolio', type: 'text' },
  { name: 'secondaryPortfolio', label: 'Secondary Portfolio', type: 'text' },
  { name: 'otherPortfolio', label: 'Other Portfolio', type: 'text' },
  { name: 'learningHours', label: 'Learning Hours', type: 'number' },
  { name: 'businessChemistry', label: 'Business Chemistry', type: 'text' },
  { name: 'certificationsPlanned', label: 'Certifications Planned', type: 'text' },
  { name: 'ceBaseline', label: 'CE Baseline', type: 'text' },
  { name: 'mobile', label: 'Mobile#', type: 'text' },
  { name: 'shift', label: 'Shift', type: 'text', placeholder: 'e.g. 9:00 AM to 6:00 PM' },
  {
    name: 'support',
    label: 'Support',
    type: 'select',
    options: CXO_TEAM_SUPPORT_OPTIONS,
    required: true,
  },
  { name: 'timeSlot', label: 'Time Slot', type: 'text', placeholder: 'e.g. 9:00 AM - 1:00 PM' },
];

export const CXO_TEAM_EMPTY_VALUES = {
  name: '',
  emailId: '',
  empIdOld: '',
  empIdNew: '',
  level: '',
  careerLevel: '',
  designation: '',
  priorExperience: '',
  joiningDate: '',
  lastPromotionDate: '',
  backupTeamMember: '',
  coach: '',
  location: '',
  place: '',
  group: '',
  primaryPortfolio: '',
  secondaryPortfolio: '',
  otherPortfolio: '',
  learningHours: '',
  businessChemistry: '',
  certificationsPlanned: '',
  ceBaseline: '',
  mobile: '',
  shift: '',
  support: 'available',
  timeSlot: '',
};

// By request, the Team Member CSV template covers every core identity/
// org field -- everything CXO_TEAM_FIELDS collects except Shift,
// Support, and Time Slot, which are roster-driven (synced from
// team_roster_entries via the monthly upload, not something you'd
// bulk-set when creating/editing team members themselves) and belong to
// the separate Team Roster template instead (see TeamHierarchyPage.jsx's
// ROSTER_EXPORT_FIELDS, which covers exactly those three plus Employee
// Email + Date) -- and except overallExperience/firmExperience/
// timeInRole, the three computed fields (see CXO_TEAM_FIELDS' docblock),
// which can't be bulk-set either since nothing ever writes to them
// directly.
const CXO_TEAM_EXPORT_FIELDS = [
  { header: 'Name', key: 'name' },
  { header: 'Email Id', key: 'emailId' },
  { header: 'Emp Id Old', key: 'empIdOld' },
  { header: 'Emp Id New', key: 'empIdNew' },
  { header: 'Level', key: 'level' },
  { header: 'Career Level', key: 'careerLevel' },
  { header: 'Designation', key: 'designation' },
  { header: 'Prior Experience', key: 'priorExperience' },
  { header: 'Date Of Joining', key: 'joiningDate' },
  { header: 'Last Promotion', key: 'lastPromotionDate' },
  { header: 'Backup Team Member', key: 'backupTeamMember' },
  { header: 'Coach', key: 'coach' },
  { header: 'Location', key: 'location' },
  { header: 'Place/Floor', key: 'place' },
  { header: 'Group', key: 'group' },
  { header: 'Primary Portfolio', key: 'primaryPortfolio' },
  { header: 'Secondary Portfolio', key: 'secondaryPortfolio' },
  { header: 'Other Portfolio', key: 'otherPortfolio' },
  { header: 'Learning Hours', key: 'learningHours' },
  { header: 'Business Chemistry', key: 'businessChemistry' },
  { header: 'Certifications Planned', key: 'certificationsPlanned' },
  { header: 'CE Baseline', key: 'ceBaseline' },
  { header: 'Mobile#', key: 'mobile' },
];

/** Maps one parsed CSV row (raw string columns) into a create payload. */
function mapImportRow(raw) {
  return {
    name: raw.Name,
    emailId: raw['Email Id'],
    empIdOld: raw['Emp Id Old'] || undefined,
    empIdNew: raw['Emp Id New'],
    level: raw.Level || undefined,
    careerLevel: raw['Career Level'] || undefined,
    designation: raw.Designation,
    priorExperience: raw['Prior Experience'] || undefined,
    joiningDate: raw['Date Of Joining'] || undefined,
    lastPromotionDate: raw['Last Promotion'] || undefined,
    backupTeamMember: raw['Backup Team Member'] || undefined,
    coach: raw.Coach || undefined,
    location: raw.Location || undefined,
    place: raw['Place/Floor'] || undefined,
    group: raw.Group || undefined,
    primaryPortfolio: raw['Primary Portfolio'] || undefined,
    secondaryPortfolio: raw['Secondary Portfolio'] || undefined,
    otherPortfolio: raw['Other Portfolio'] || undefined,
    learningHours: raw['Learning Hours'] || undefined,
    businessChemistry: raw['Business Chemistry'] || undefined,
    certificationsPlanned: raw['Certifications Planned'] || undefined,
    ceBaseline: raw['CE Baseline'] || undefined,
    mobile: raw['Mobile#'] || undefined,
  };
}

// Shown as the one example row in the downloadable import template, so
// an admin can see the expected format/values without guessing.
const CXO_TEAM_TEMPLATE_SAMPLE_ROW = {
  name: 'Jane Doe',
  emailId: 'jane.doe@sample.com',
  empIdOld: '',
  empIdNew: 1001,
  level: 'L5',
  careerLevel: 'Senior Manager',
  designation: 'Director of Engineering',
  priorExperience: 4,
  joiningDate: new Date().toISOString().slice(0, 10),
  lastPromotionDate: '',
  backupTeamMember: 'John Smith',
  coach: 'Priya Sharma',
  location: 'Bangalore',
  place: 'HQ Tower',
  group: 'Engineering',
  primaryPortfolio: 'Digital Transformation',
  secondaryPortfolio: 'Cloud Infrastructure',
  otherPortfolio: '',
  learningHours: 16,
  businessChemistry: 'Driver',
  certificationsPlanned: 'PMP',
  ceBaseline: 'On Track',
  mobile: '+1-555-0101',
};

export const CXO_TEAM_CSV_CONFIG = {
  exportFields: CXO_TEAM_EXPORT_FIELDS,
  filenamePrefix: 'team-members',
  mapImportRow,
  templateSampleRow: CXO_TEAM_TEMPLATE_SAMPLE_ROW,
};
