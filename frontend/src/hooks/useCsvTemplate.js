import { buildCsvTemplate, downloadCsv } from '../utils/csv.js';

/**
 * Downloads a CSV template for a resource: the header row an import
 * expects, plus one example row when `sampleRow` is provided. Shares
 * `exportFields` with useCsvExport so a resource's CSV column
 * definitions live in exactly one place (its `*.management.config.js`).
 */
export default function useCsvTemplate(exportFields, filenamePrefix, sampleRow = null) {
  const downloadTemplate = () => {
    const csv = buildCsvTemplate(exportFields, sampleRow);
    downloadCsv(`${filenamePrefix}-template.csv`, csv);
  };

  return { downloadTemplate };
}
