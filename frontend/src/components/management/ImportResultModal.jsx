import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';

/**
 * Reports the outcome of a CSV import: how many rows were created vs.
 * failed, which mode ran (append/replace), and — the important part —
 * every failed row's number and validation message, so an admin can
 * fix the exact rows a spreadsheet rejected instead of guessing.
 * Generic and resource-agnostic; every management page's CSV import
 * uses this same modal (see useManagementPageState/ManagementPage).
 */
export default function ImportResultModal({ isOpen, result, resourceLabel, onClose }) {
  const { created = [], failed = [], mode, totalRows } = result || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${resourceLabel} import results`}
      className="max-w-lg"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <div className="space-y-3">
        <Alert variant={failed.length ? 'warning' : 'success'}>
          {mode === 'replace' ? 'Existing data was replaced. ' : ''}
          Imported {created.length} of {totalRows ?? created.length + failed.length} row(s)
          {failed.length ? `, ${failed.length} failed` : ''}.
        </Alert>

        {failed.length > 0 && (
          <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200">
            <ul className="divide-y divide-slate-100">
              {failed.map((item) => (
                <li key={item.row ?? item.id} className="px-3 py-2 text-sm">
                  <p className="font-medium text-slate-800">Row {item.row}</p>
                  <p className="text-red-600">{item.message}</p>
                  {item.details?.length > 0 && (
                    <ul className="mt-1 list-disc pl-4 text-xs text-slate-500">
                      {item.details.map((detail, index) => (
                        <li key={index}>
                          {detail.field ? `${detail.field}: ` : ''}
                          {detail.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
