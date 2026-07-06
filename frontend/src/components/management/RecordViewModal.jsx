import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

function displayValue(field, record) {
  if (!record) return '';
  const raw = record[field.name];

  if (field.formatValue) return field.formatValue(raw, record);
  if (Array.isArray(raw)) return raw.join(', ') || '—';
  if (raw === undefined || raw === null || raw === '') return '—';
  if (field.type === 'select' && field.options) {
    return field.options.find((option) => option.value === raw)?.label || raw;
  }
  return String(raw);
}

/**
 * Generic read-only detail view, driven by the same `fields` config as
 * RecordFormModal (label + name), so a resource doesn't need a second
 * config just to display a record. Every management page's "View"
 * action opens this.
 */
export default function RecordViewModal({ isOpen, record, fields, resourceLabel, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${resourceLabel} details`}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <dl className="space-y-2">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-0.5 border-b border-slate-100 pb-2 last:border-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{field.label}</dt>
            <dd className="text-sm text-slate-800">{displayValue(field, record)}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
