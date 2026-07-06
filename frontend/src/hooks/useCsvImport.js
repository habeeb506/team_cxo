import { useState } from 'react';

import { parseCsv } from '../utils/csv.js';
import useToast from './useToast.js';

/**
 * Parses a CSV file and posts the rows to the resource's bulk-import
 * endpoint. `mapRow(rawRow)` adapts raw CSV columns (always strings)
 * into the shape the resource's create schema expects -- e.g. splitting
 * a pipe-separated column into an array, or resolving a lookup value.
 */
export default function useCsvImport(apiService, mapRow = (row) => row) {
  const { addToast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState(null);

  /**
   * `mode` is 'append' (default) or 'replace' -- see ApiService.bulkImport
   * for what each does on the backend.
   */
  const importFile = async (file, mode = 'append') => {
    setIsImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const rows = parseCsv(text).map(mapRow);

      if (rows.length === 0) {
        addToast('No rows found in file', { variant: 'warning' });
        return null;
      }

      const response = await apiService.bulkImport(rows, mode);
      const summary = { ...response.data, totalRows: rows.length };
      setResult(summary);
      addToast(
        `Imported ${summary.created.length} of ${rows.length} row(s)` +
          (summary.failed.length ? `, ${summary.failed.length} failed` : ''),
        { variant: summary.failed.length ? 'warning' : 'success' },
      );
      return summary;
    } catch (err) {
      addToast(err.message || 'Import failed', { variant: 'error' });
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  return { importFile, isImporting, result };
}
