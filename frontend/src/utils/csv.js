/**
 * Minimal, dependency-free CSV utilities. Every resource's import/export
 * feature reuses these instead of hand-rolling CSV handling or pulling
 * in a library for something this small.
 */

function escapeCsvValue(value) {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts rows to CSV text. `fields` is [{ header, key, getValue? }] --
 * `getValue(row)` takes precedence over `row[key]` when a field needs
 * custom formatting (e.g. joining an array, reading a populated ref).
 */
export function objectsToCsv(rows, fields) {
  const header = fields.map((field) => field.header).join(',');
  const lines = rows.map((row) =>
    fields
      .map((field) => escapeCsvValue(field.getValue ? field.getValue(row) : row[field.key]))
      .join(','),
  );
  return [header, ...lines].join('\n');
}

/**
 * Builds a downloadable CSV template for a resource: the exact header
 * row an import expects, optionally followed by one example row so an
 * admin can see the expected format/values at a glance. `fields` is the
 * same [{ header, key, getValue? }] shape as objectsToCsv/exportFields
 * -- a resource's existing export config doubles as its template
 * config, no separate header list to maintain.
 */
export function buildCsvTemplate(fields, sampleRow = null) {
  return objectsToCsv(sampleRow ? [sampleRow] : [], fields);
}

/** Triggers a browser download of `csvContent` as `filename`. */
export function downloadCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses CSV text into an array of plain objects keyed by the header
 * row. Handles quoted fields containing commas, newlines, and escaped
 * quotes -- the cases a naive `split(',')` gets wrong.
 */
export function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && next === '\n') i++;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((cols) => cols.length > 1 || cols[0] !== '');
  const [headerRow, ...dataRows] = nonEmptyRows;
  if (!headerRow) return [];

  return dataRows.map((cols) => {
    const obj = {};
    headerRow.forEach((key, index) => {
      obj[key.trim()] = (cols[index] ?? '').trim();
    });
    return obj;
  });
}

/**
 * Fetches every page of a list endpoint (respecting current
 * filters/search) into one array -- used by CSV export so it isn't
 * capped at a single page's limit.
 */
export async function fetchAllRecords(apiService, params = {}, pageSize = 100) {
  let page = 1;
  let totalPages = 1;
  let all = [];

  do {
    const response = await apiService.getAll({ ...params, page, limit: pageSize });
    all = all.concat(response.data || []);
    totalPages = response.pagination?.totalPages || 1;
    page++;
  } while (page <= totalPages);

  return all;
}
