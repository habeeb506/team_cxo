import { useState } from 'react';

import useApiResource from './useApiResource.js';
import useMutation from './useMutation.js';
import useRowSelection from './useRowSelection.js';
import useCsvExport from './useCsvExport.js';
import useCsvImport from './useCsvImport.js';
import useCsvTemplate from './useCsvTemplate.js';
import useToggle from './useToggle.js';
import useToast from './useToast.js';
import { invalidateCache } from '../utils/apiCache.js';

/**
 * All the state and handlers a management page needs: list (pagination
 * /filter/search), create/edit/view/delete, bulk delete, and CSV
 * import/export. Every resource's page calls this once with its config
 * and renders <ManagementPage {...state} .../> -- no page re-implements
 * any of this wiring.
 *
 * config: { apiService, resourceLabel, emptyValues, fields, csv,
 *   getRowId?, mapRecordToFormValues?, transformSubmitValues? }
 */
export default function useManagementPageState(config) {
  const {
    apiService,
    resourceLabel,
    emptyValues,
    csv,
    getRowId = (row) => row._id || row.id,
    mapRecordToFormValues = (record) => record,
    transformSubmitValues = (values) => values,
  } = config;

  const { addToast } = useToast();
  const list = useApiResource(apiService);
  const selection = useRowSelection();

  const [isFormOpen, formActions] = useToggle(false);
  const [isViewOpen, viewActions] = useToggle(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [isBulkDeleteConfirmOpen, bulkDeleteConfirmActions] = useToggle(false);
  const [isImportResultOpen, importResultActions] = useToggle(false);
  const [importResult, setImportResult] = useState(null);

  const createMutation = useMutation((values) => apiService.create(values));
  const updateMutation = useMutation((values) => apiService.update(editingRecord._id, values));
  const deleteMutation = useMutation((id) => apiService.remove(id));
  const bulkDeleteMutation = useMutation((ids) => apiService.bulkDelete(ids));

  const { exportCsv, isExporting } = useCsvExport(apiService, csv.exportFields, csv.filenamePrefix);
  const { importFile, isImporting } = useCsvImport(apiService, csv.mapImportRow);
  const { downloadTemplate } = useCsvTemplate(csv.exportFields, csv.filenamePrefix, csv.templateSampleRow);

  const refreshList = () => {
    invalidateCache(apiService.resourcePath);
    list.refetch();
  };

  const openCreate = () => {
    setEditingRecord(null);
    formActions.setTrue();
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    formActions.setTrue();
  };

  const openView = (record) => {
    setViewingRecord(record);
    viewActions.setTrue();
  };

  const handleFormSubmit = async (rawValues) => {
    const values = transformSubmitValues(rawValues);
    try {
      if (editingRecord) {
        await updateMutation.mutate(values);
        addToast(`${resourceLabel} updated`, { variant: 'success' });
      } else {
        await createMutation.mutate(values);
        addToast(`${resourceLabel} created`, { variant: 'success' });
      }
      refreshList();
    } catch (err) {
      addToast(err.message || 'Something went wrong', { variant: 'error' });
      throw err; // re-thrown so the form can surface field-level errors
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutate(deletingRecord._id);
      addToast(`${resourceLabel} removed`, { variant: 'success' });
      setDeletingRecord(null);
      refreshList();
    } catch (err) {
      addToast(err.message || 'Something went wrong', { variant: 'error' });
    }
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selection.selectedIds);
    try {
      const response = await bulkDeleteMutation.mutate(ids);
      const summary = response.data;
      addToast(
        `Removed ${summary.deleted.length} of ${ids.length}` +
          (summary.failed.length ? `, ${summary.failed.length} failed` : ''),
        { variant: summary.failed.length ? 'warning' : 'success' },
      );
      selection.clear();
      bulkDeleteConfirmActions.setFalse();
      refreshList();
    } catch (err) {
      addToast(err.message || 'Bulk delete failed', { variant: 'error' });
    }
  };

  const handleImportFile = async (file, mode = 'append') => {
    const summary = await importFile(file, mode);
    if (!summary) return;
    refreshList();
    // Only interrupt with the results modal when something needs the
    // admin's attention -- a fully clean import already got a success
    // toast from useCsvImport.
    if (summary.failed.length > 0) {
      setImportResult(summary);
      importResultActions.setTrue();
    }
  };

  return {
    ...list,
    getRowId,
    resourceLabel,
    emptyValues,
    fields: config.fields,
    selection,
    isFormOpen,
    formMode: editingRecord ? 'edit' : 'create',
    editingRecord,
    formInitialValues: editingRecord ? mapRecordToFormValues(editingRecord) : null,
    openCreate,
    openEdit,
    closeForm: formActions.setFalse,
    handleFormSubmit,
    isViewOpen,
    viewingRecord,
    openView,
    closeView: viewActions.setFalse,
    deletingRecord,
    setDeletingRecord,
    confirmDelete,
    isDeleting: deleteMutation.isLoading,
    isBulkDeleteConfirmOpen,
    openBulkDeleteConfirm: bulkDeleteConfirmActions.setTrue,
    closeBulkDeleteConfirm: bulkDeleteConfirmActions.setFalse,
    confirmBulkDelete,
    isBulkDeleting: bulkDeleteMutation.isLoading,
    isExporting,
    exportCsv: () => exportCsv({ ...list.filters, search: list.search || undefined }),
    isImporting,
    importFile: handleImportFile,
    downloadTemplate,
    isImportResultOpen,
    importResult,
    closeImportResult: importResultActions.setFalse,
  };
}
