import { useState } from 'react';

import teamRosterApiService from '../../api/services/teamRosterApiService.js';
import { parseCsv } from '../../utils/csv.js';
import { parseExcelFile } from '../../utils/excelTemplate.js';
import useToast from '../../hooks/useToast.js';

const XLSX_EXTENSION_PATTERN = /\.xlsx$/i;

/**
 * Parses a monthly roster file (one row per person per day -- columns
 * "Employee Email", "Date", "Support", "Shift", "Time Slot") and posts
 * it to POST /team-roster/import. Accepts either a plain .csv or the
 * downloadable .xlsx template (see pages/TeamHierarchyPage.jsx's
 * "Download Roster Template" button and utils/excelTemplate.js) --
 * `parseExcelFile` returns the exact same shape `parseCsv` does (an
 * array of header-keyed objects), so the mapping below doesn't care
 * which format the file actually was. Deliberately its own hook rather
 * than reusing hooks/useCsvImport.js -- that hook always calls a
 * resource's generic `apiService.bulkImport(records, mode)`
 * (POST /:resource/import with an append/replace mode), while the
 * roster always upserts by (member, date) with no replace-mode concept
 * (see TeamRosterService.importRoster), and posts through
 * teamRosterApiService.importRoster instead of a generic ApiService
 * method.
 */
export default function useTeamRosterUpload() {
  const { addToast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState(null);

  const uploadFile = async (file) => {
    setIsImporting(true);
    setResult(null);
    try {
      const rawRows = XLSX_EXTENSION_PATTERN.test(file.name)
        ? await parseExcelFile(file)
        : parseCsv(await file.text());

      const records = rawRows.map((raw) => ({
        email: raw['Employee Email'],
        date: raw.Date,
        support: (raw.Support || '').trim().toLowerCase(),
        shift: raw.Shift || undefined,
        timeSlot: raw['Time Slot'] || undefined,
      }));

      if (records.length === 0) {
        addToast('No rows found in file', { variant: 'warning' });
        return null;
      }

      const response = await teamRosterApiService.importRoster(records);
      const summary = { ...response.data, totalRows: records.length };
      setResult(summary);
      addToast(
        `Imported ${summary.created.length} of ${records.length} row(s)` +
          (summary.failed.length ? `, ${summary.failed.length} failed` : ''),
        { variant: summary.failed.length ? 'warning' : 'success' },
      );
      return summary;
    } catch (err) {
      addToast(err.message || 'Roster upload failed', { variant: 'error' });
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  return { uploadFile, isImporting, result, clearResult: () => setResult(null) };
}
