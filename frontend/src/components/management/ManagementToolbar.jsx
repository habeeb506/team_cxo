import { useRef, useState } from 'react';

import SearchBar from '../ui/SearchBar.jsx';
import Select from '../ui/Select.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';

const IMPORT_MODE_OPTIONS = [
  { value: 'append', label: 'Append to existing data' },
  { value: 'replace', label: 'Replace existing data' },
];

/**
 * Search + filter controls + primary actions (add, CSV template/import/
 * export, bulk delete) for a management page. Purely presentational --
 * all state and handlers are owned by hooks/useManagementPageState.js,
 * except the import-mode selection and the "replace" confirmation,
 * which are self-contained UI concerns that don't need to live in the
 * shared page state.
 */
export default function ManagementToolbar({
  searchPlaceholder,
  onSearch,
  filters,
  filterValues,
  onFilterChange,
  onAdd,
  onDownloadTemplate,
  onImportFile,
  isImporting,
  onExport,
  isExporting,
  selectedCount,
  onBulkDelete,
  resourceLabel,
}) {
  const fileInputRef = useRef(null);
  const [importMode, setImportMode] = useState('append');
  const [pendingFile, setPendingFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    // Replacing data is destructive (it soft-deletes the current
    // roster), so confirm before it actually runs. Append just imports.
    if (importMode === 'replace') {
      setPendingFile(file);
    } else {
      onImportFile(file, importMode);
    }
  };

  const confirmReplace = () => {
    onImportFile(pendingFile, 'replace');
    setPendingFile(null);
  };

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar onSearch={onSearch} placeholder={searchPlaceholder} className="sm:max-w-xs" />
          {filters.map((filter) => (
            <Select
              key={filter.name}
              placeholder={filter.label}
              options={filter.options}
              value={filterValues[filter.name] || ''}
              onChange={(event) =>
                onFilterChange({ ...filterValues, [filter.name]: event.target.value || undefined })
              }
              className="sm:max-w-[180px]"
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCount > 0 && (
            <Button variant="danger" size="sm" onClick={onBulkDelete}>
              Delete selected ({selectedCount})
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onDownloadTemplate}>
            Download Template
          </Button>
          <Button variant="secondary" size="sm" isLoading={isExporting} onClick={onExport}>
            Export CSV
          </Button>
          <Select
            value={importMode}
            onChange={(event) => setImportMode(event.target.value)}
            options={IMPORT_MODE_OPTIONS}
            className="sm:max-w-[190px]"
          />
          <Button
            variant="secondary"
            size="sm"
            isLoading={isImporting}
            onClick={() => fileInputRef.current?.click()}
          >
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button size="sm" onClick={onAdd}>
            Add {resourceLabel}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingFile)}
        title="Replace existing data"
        message={`This will remove all existing ${resourceLabel.toLowerCase()} records and replace them with the uploaded file. This can be undone later by an administrator, but the current data will disappear from every view immediately. Continue?`}
        confirmLabel="Replace data"
        variant="danger"
        onConfirm={confirmReplace}
        onCancel={() => setPendingFile(null)}
      />
    </div>
  );
}
