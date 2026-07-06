import { CXO_TEAM_STATUS_OPTIONS } from './cxoTeam.constants.js';

/** Table columns for the Team Members management page. */
export const CXO_TEAM_COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'emailId', header: 'Email' },
  { key: 'designation', header: 'Designation' },
  { key: 'group', header: 'Group' },
  { key: 'status', header: 'Status' },
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
