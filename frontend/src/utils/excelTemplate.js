import ExcelJS from 'exceljs';

/**
 * Excel (.xlsx) template/import utilities -- the real-dropdown
 * counterpart to utils/csv.js. Plain CSV is just text, so a "Support
 * column should be a dropdown" request can't actually be satisfied by
 * a CSV file no matter what the header says; Excel's native list data
 * validation is a spreadsheet-format feature, which is why this exists
 * as a separate, opt-in template builder rather than a mode of
 * buildCsvTemplate. Every other resource's CSV template/import
 * (Team Members, Business Teams, Permissions, Tasks) is unaffected --
 * this is used only where a field genuinely needs a dropdown (currently
 * just the Team Roster template's Support column, see
 * pages/TeamHierarchyPage.jsx).
 */

/**
 * Builds and downloads an .xlsx template. `fields` is
 * `[{ header, key, options? }]` -- the same shape CSV template configs
 * already use, with an optional `options` (an array of strings, or
 * `[{ value, label }]` objects) on any field that should get a real
 * Excel dropdown. The dropdown is applied down `dropdownRowCount` rows
 * below the header (default 500) -- comfortably more than a real
 * monthly upload needs -- so it's still there no matter how many rows
 * someone fills in, not just the one sample row.
 */
export async function downloadExcelTemplate({
  fields,
  sampleRow = null,
  filename,
  sheetName = 'Template',
  dropdownRowCount = 500,
}) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = fields.map((field) => ({
    header: field.header,
    key: field.key,
    width: Math.max(field.header.length + 4, 16),
  }));
  worksheet.getRow(1).font = { bold: true };

  if (sampleRow) worksheet.addRow(sampleRow);

  fields.forEach((field, index) => {
    if (!field.options || field.options.length === 0) return;
    const values = field.options.map((option) => (typeof option === 'string' ? option : option.label));
    const columnNumber = index + 1;
    // `worksheet.getColumn(n)` returns exceljs's `Column` object, which
    // only exposes `eachCell`/`values` -- it has no `getCell` method (that
    // was the original bug here: "column.getCell is not a function").
    // Individual cell access -- including setting `dataValidation`, a
    // per-cell property -- only exists on `Worksheet`/`Row`, so this goes
    // through `worksheet.getCell(row, column)` instead.
    for (let rowNumber = 2; rowNumber <= dropdownRowCount + 1; rowNumber++) {
      worksheet.getCell(rowNumber, columnNumber).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${values.join(',')}"`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid value',
        error: `Please choose one of: ${values.join(', ')}`,
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
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
 * Parses an uploaded .xlsx file's first worksheet into the same shape
 * utils/csv.js's `parseCsv` returns -- an array of plain objects keyed
 * by the header row's text -- so a caller (see
 * features/cxoTeams/useTeamRosterUpload.js) can accept either a .csv or
 * a filled-in .xlsx template through one identical downstream mapping
 * step, without caring which format the file was.
 */
export async function parseExcelFile(file) {
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  // `.values` is 1-indexed with a leading `undefined` at index 0.
  const headers = worksheet.getRow(1).values.slice(1).map((value) => String(value ?? '').trim());

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header row, already read above
    const values = row.values.slice(1);
    const isEmptyRow = values.every((value) => value === null || value === undefined || String(value).trim() === '');
    if (isEmptyRow) return;

    const record = {};
    headers.forEach((header, index) => {
      record[header] = formatCellValue(values[index]);
    });
    rows.push(record);
  });

  return rows;
}

/** Excel dates come back as JS `Date` objects, not strings -- normalize to 'YYYY-MM-DD' like a typed date would read. */
function formatCellValue(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}
