import { useState } from 'react';

import { fetchAllRecords, objectsToCsv, downloadCsv } from '../utils/csv.js';
import useToast from './useToast.js';

/**
 * Exports every record matching the current filters/search (not just
 * the current page) as a CSV download. `exportFields` is the same
 * [{ header, key, getValue? }] shape used by utils/csv.js.
 */
export default function useCsvExport(apiService, exportFields, filenamePrefix) {
  const { addToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async (params = {}) => {
    setIsExporting(true);
    try {
      const records = await fetchAllRecords(apiService, params);
      const csv = objectsToCsv(records, exportFields);
      const filename = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv(filename, csv);
      addToast(`Exported ${records.length} record(s)`, { variant: 'success' });
    } catch (err) {
      addToast(err.message || 'Export failed', { variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCsv, isExporting };
}
