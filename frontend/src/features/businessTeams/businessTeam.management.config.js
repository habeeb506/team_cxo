/** Table columns for the Business Teams management page. */
export const BUSINESS_TEAM_COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'emailId', header: 'Email' },
  { key: 'business', header: 'Business' },
  { key: 'location', header: 'Location' },
  { key: 'room', header: 'Room' },
];

// business/location/room are free-text, not fixed enums, so this page
// relies on search rather than dropdown filters.
export const BUSINESS_TEAM_FILTERS = [];

export const BUSINESS_TEAM_FIELDS = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'emailId', label: 'Email', type: 'email', required: true },
  { name: 'business', label: 'Business', type: 'text', required: true },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'place', label: 'Place', type: 'text' },
  { name: 'room', label: 'Room', type: 'text' },
];

export const BUSINESS_TEAM_EMPTY_VALUES = {
  name: '',
  emailId: '',
  business: '',
  location: '',
  place: '',
  room: '',
};

const BUSINESS_TEAM_EXPORT_FIELDS = [
  { header: 'Name', key: 'name' },
  { header: 'Email', key: 'emailId' },
  { header: 'Business', key: 'business' },
  { header: 'Location', key: 'location' },
  { header: 'Place', key: 'place' },
  { header: 'Room', key: 'room' },
];

function mapImportRow(raw) {
  return {
    name: raw.Name,
    emailId: raw.Email,
    business: raw.Business,
    location: raw.Location || undefined,
    place: raw.Place || undefined,
    room: raw.Room || undefined,
  };
}

// Shown as the one example row in the downloadable import template.
const BUSINESS_TEAM_TEMPLATE_SAMPLE_ROW = {
  name: 'Alex Rivera',
  emailId: 'alex.rivera@sample.com',
  business: 'Payments',
  location: 'Bangalore',
  place: 'Tech Park',
  room: '4B-201',
};

export const BUSINESS_TEAM_CSV_CONFIG = {
  exportFields: BUSINESS_TEAM_EXPORT_FIELDS,
  filenamePrefix: 'business-teams',
  mapImportRow,
  templateSampleRow: BUSINESS_TEAM_TEMPLATE_SAMPLE_ROW,
};
