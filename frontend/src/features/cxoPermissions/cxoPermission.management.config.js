import { PERMISSION_ACTION_OPTIONS, PERMISSION_RESOURCE_OPTIONS } from './cxoPermission.constants.js';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'Never');
const resourceLabel = (value) =>
  PERMISSION_RESOURCE_OPTIONS.find((option) => option.value === value)?.label || value;

/** Table columns for the Permissions management page. */
export const CXO_PERMISSION_COLUMNS = [
  { key: 'member', header: 'Member', render: (row) => row.member?.name || '—' },
  { key: 'resource', header: 'Resource', render: (row) => resourceLabel(row.resource) },
  { key: 'actions', header: 'Actions', render: (row) => (row.actions || []).join(', ') },
  { key: 'expiresAt', header: 'Expires', render: (row) => formatDate(row.expiresAt) },
];

export const CXO_PERMISSION_FILTERS = [
  {
    name: 'resource',
    label: 'All resources',
    options: PERMISSION_RESOURCE_OPTIONS.filter((option) => option.value !== '*'),
  },
];

export const CXO_PERMISSION_EMPTY_VALUES = {
  member: '',
  resource: '',
  actions: [],
  expiresAt: '',
};

/**
 * `memberOptions` is built at render time from the current team roster
 * (see pages/PermissionsPage.jsx), so this is a builder function rather
 * than a static export.
 */
export function buildCxoPermissionFields(memberOptions) {
  return [
    {
      name: 'member',
      label: 'Member',
      type: 'select',
      options: memberOptions,
      required: true,
      placeholder: 'Select a team member',
      formatValue: (_value, record) => record.member?.name || '—',
    },
    { name: 'resource', label: 'Resource', type: 'select', options: PERMISSION_RESOURCE_OPTIONS, required: true },
    { name: 'actions', label: 'Actions', type: 'multiselect', options: PERMISSION_ACTION_OPTIONS, required: true },
    { name: 'expiresAt', label: 'Expires At', type: 'date', formatValue: (value) => formatDate(value) },
  ];
}

// Shown as the one example row in the downloadable import template.
// Shaped like a populated record (row.member as an object) to match
// what the exportFields' getValue functions below expect.
const CXO_PERMISSION_TEMPLATE_SAMPLE_ROW = {
  member: { emailId: 'jane.doe@sample.com' },
  resource: 'business_teams',
  actions: ['read', 'update'],
  expiresAt: null,
};

/**
 * `emailToId` resolves a "Member Email" CSV column back into the
 * ObjectId the backend expects, built from the roster fetched by
 * pages/PermissionsPage.jsx.
 */
export function buildCxoPermissionCsvConfig(emailToId) {
  return {
    exportFields: [
      { header: 'Member Email', getValue: (row) => row.member?.emailId || '' },
      { header: 'Resource', key: 'resource' },
      { header: 'Actions', getValue: (row) => (row.actions || []).join('|') },
      {
        header: 'Expires At',
        getValue: (row) => (row.expiresAt ? new Date(row.expiresAt).toISOString().slice(0, 10) : ''),
      },
    ],
    filenamePrefix: 'permissions',
    mapImportRow: (raw) => ({
      member: emailToId[(raw['Member Email'] || '').trim().toLowerCase()],
      resource: raw.Resource,
      actions: (raw.Actions || '')
        .split('|')
        .map((action) => action.trim())
        .filter(Boolean),
      expiresAt: raw['Expires At'] || undefined,
    }),
    templateSampleRow: CXO_PERMISSION_TEMPLATE_SAMPLE_ROW,
  };
}
