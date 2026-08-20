import Card from '../ui/Card.jsx';
import DataTable from '../ui/DataTable.jsx';
import PaginationControls from '../ui/PaginationControls.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import ManagementToolbar from './ManagementToolbar.jsx';
import RecordFormModal from './RecordFormModal.jsx';
import RecordViewModal from './RecordViewModal.jsx';
import ImportResultModal from './ImportResultModal.jsx';
import useManagementPageState from '../../hooks/useManagementPageState.js';

const defaultRowLabel = (row) => row?.name || row?.emailId || 'this record';

/**
 * The generic CRUD management page. A resource's page file (e.g.
 * pages/TeamMembersPage.jsx) is just: build a config object (apiService,
 * fields, csv, ...) and render <ManagementPage title=... columns={...}
 * config={config} />. Business Teams, Permissions, and every future
 * module reuse this exact component -- none of them re-implement
 * fetching, pagination, modals, or bulk actions.
 */
export default function ManagementPage({ title, description, columns, filters = [], config }) {
  const state = useManagementPageState(config);
  const getRowLabel = config.getRowLabel || defaultRowLabel;

  const actionColumn = {
    key: '__actions',
    header: '',
    // Pinned to the right of the table's scroll area (see
    // components/ui/DataTable.jsx) so View/Edit/Delete stay reachable
    // even when a resource has enough columns to need horizontal
    // scrolling (e.g. Team Members, Business Teams).
    sticky: 'right',
    render: (row) => (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => state.openView(row)}>
          View
        </Button>
        <Button variant="ghost" size="sm" onClick={() => state.openEdit(row)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => state.setDeletingRecord(row)}>
          Delete
        </Button>
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <Card>
        <ManagementToolbar
          searchPlaceholder={`Search ${title.toLowerCase()}...`}
          onSearch={state.setSearch}
          filters={filters}
          filterValues={state.filters}
          onFilterChange={state.setFilters}
          onAdd={state.openCreate}
          onDownloadTemplate={state.downloadTemplate}
          downloadTemplateLabel={config.templateLabel}
          onImportFile={state.importFile}
          isImporting={state.isImporting}
          onExport={state.exportCsv}
          isExporting={state.isExporting}
          selectedCount={state.selection.selectedIds.size}
          onBulkDelete={state.openBulkDeleteConfirm}
          resourceLabel={state.resourceLabel}
        />

        {state.error && (
          <Alert variant="error" className="mb-4">
            {state.error}
          </Alert>
        )}

        <DataTable
          columns={[...columns, actionColumn]}
          rows={state.data}
          isLoading={state.isLoading}
          emptyMessage={`No ${title.toLowerCase()} yet`}
          selectable
          selectedIds={state.selection.selectedIds}
          onToggleRow={state.selection.toggleRow}
          onToggleAll={() => state.selection.toggleAll(state.data, state.getRowId)}
          getRowId={state.getRowId}
        />
        <PaginationControls pagination={state.pagination} onPageChange={state.setPage} />
      </Card>

      <RecordFormModal
        key={state.editingRecord?._id || 'create'}
        isOpen={state.isFormOpen}
        mode={state.formMode}
        fields={state.fields}
        emptyValues={state.emptyValues}
        initialValues={state.formInitialValues}
        resourceLabel={state.resourceLabel}
        onClose={state.closeForm}
        onSubmit={state.handleFormSubmit}
        className={config.formClassName}
      />

      <RecordViewModal
        isOpen={state.isViewOpen}
        record={state.viewingRecord}
        fields={state.fields}
        resourceLabel={state.resourceLabel}
        onClose={state.closeView}
      />

      <ConfirmDialog
        isOpen={Boolean(state.deletingRecord)}
        title={`Remove ${state.resourceLabel}`}
        message={`Remove ${getRowLabel(state.deletingRecord)}? This can be restored later by an administrator.`}
        confirmLabel="Remove"
        variant="danger"
        isLoading={state.isDeleting}
        onConfirm={state.confirmDelete}
        onCancel={() => state.setDeletingRecord(null)}
      />

      <ConfirmDialog
        isOpen={state.isBulkDeleteConfirmOpen}
        title="Remove selected records"
        message={`Remove ${state.selection.selectedIds.size} selected record(s)? This can be restored later by an administrator.`}
        confirmLabel="Remove"
        variant="danger"
        isLoading={state.isBulkDeleting}
        onConfirm={state.confirmBulkDelete}
        onCancel={state.closeBulkDeleteConfirm}
      />

      <ImportResultModal
        isOpen={state.isImportResultOpen}
        result={state.importResult}
        resourceLabel={state.resourceLabel}
        onClose={state.closeImportResult}
      />
    </div>
  );
}
