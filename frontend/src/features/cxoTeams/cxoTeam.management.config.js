import { CXO_TEAM_STATUS_OPTIONS } from './cxoTeam.constants.js';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

/**
 * Table columns for the Team Members management page -- every business
 * field the `cxo_teams` document has (see backend/src/models/CxoTeam.model.js),
 * not just a handful. Internal-only fields (isDeleted, deletedAt,
 * createdBy, updatedBy, schemaVersion, metadata) are intentionally left
 * out -- they exist for soft-delete/audit plumbing (see
 * models/plugins/auditableSchema.plugin.js), not anything a Team
 * Members viewer needs to see, and are always empty until real
 * authentication exists anyway. `lead`/`manager` render the referenced
 * member's name because CxoTeamService.list/getById populates them
 * (see backend/src/services/CxoTeamService.js) instead of returning a
 * raw ObjectId.
 */
export const CXO_TEAM_COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'emailId', header: 'Email' },
  { key: 'empIdNew', header: 'Employee ID' },
  { key: 'empIdOld', header: 'Legacy ID', render: (row) => row.empIdOld || '—' },
  { key: 'designation', header: 'Designation' },
  { key: 'level', header: 'Level', render: (row) => row.level || '—' },
  { key: 'group', header: 'Group', render: (row) => row.group || '—' },
  { key: 'location', header: 'Location', render: (row) => row.location || '—' },
  { key: 'place', header: 'Place', render: (row) => row.place || '—' },
  { key: 'profilePicture', header: 'Profile Picture', render: (row) => row.profilePicture || '—' },
  { key: 'lead', header: 'Lead', render: (row) => row.lead?.name || '—' },
  { key: 'manager', header: 'Manager', render: (row) => row.manager?.name || '—' },
  { key: 'status', header: 'Status', render: (row) => (row.status || '').replace('-', ' ') },
  { key: 'joiningDate', header: 'Joining Date', render: (row) => formatDate(row.joiningDate) },
  { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
  { key: 'updatedAt', header: 'Updated', render: (row) => formatDate(row.updatedAt) },
];

/** Toolbar filter dropdowns. */
export const CXO_TEAM_FILTERS = [{ name: 'status', label: 'All statuses', options: CXO_TEAM_STATUS_OPTIONS }];

/** Create/edit form + view modal field definitions, shared by both. */
export const CXO_TEAM_FIELDS = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'emailId', label: 'Email', type: 'email', required: true },
  { name: 'empIdNew', label: 'Employee ID', type: 'text', required: true },
  { name: 'empIdOld', label: 'Legacy Employee ID', type: 'text' },
  { name: 'designation', label: 'Designation', type: 'text', required: true },
  { name: 'group', label: 'Group', type: 'text' },
  { name: 'level', label: 'Level', type: 'text' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'place', label: 'Place', type: 'text' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: CXO_TEAM_STATUS_OPTIONS,
    required: true,
  },
];

export const CXO_TEAM_EMPTY_VALUES = {
  name: '',
  emailId: '',
  empIdNew: '',
  empIdOld: '',
  designation: '',
  group: '',
  level: '',
  location: '',
  place: '',
  status: 'active',
};

const CXO_TEAM_EXPORT_FIELDS = [
  { header: 'Name', key: 'name' },
  { header: 'Email', key: 'emailId' },
  { header: 'Employee ID', key: 'empIdNew' },
  { header: 'Legacy Employee ID', key: 'empIdOld' },
  { header: 'Designation', key: 'designation' },
  { header: 'Group', key: 'group' },
  { header: 'Level', key: 'level' },
  { header: 'Location', key: 'location' },
  { header: 'Place', key: 'place' },
  { header: 'Status', key: 'status' },
];

/** Maps one parsed CSV row (raw string columns) into a create payload. */
function mapImportRow(raw) {
  return {
    name: raw.Name,
    emailId: raw.Email,
    empIdNew: raw['Employee ID'],
    empIdOld: raw['Legacy Employee ID'] || undefined,
    designation: raw.Designation,
    group: raw.Group || undefined,
    level: raw.Level || undefined,
    location: raw.Location || undefined,
    place: raw.Place || undefined,
    status: raw.Status || 'active',
  };
}

// Shown as the one example row in the downloadable import template, so
// an admin can see the expected format/values without guessing.
const CXO_TEAM_TEMPLATE_SAMPLE_ROW = {
  name: 'Jane Doe',
  emailId: 'jane.doe@sample.com',
  empIdNew: 'EMP1001',
  empIdOld: '',
  designation: 'Director of Engineering',
  group: 'Engineering',
  level: 'L5',
  location: 'Bangalore',
  place: 'HQ Tower',
  status: 'active',
};

export const CXO_TEAM_CSV_CONFIG = {
  exportFields: CXO_TEAM_EXPORT_FIELDS,
  filenamePrefix: 'team-members',
  mapImportRow,
  templateSampleRow: CXO_TEAM_TEMPLATE_SAMPLE_ROW,
};
