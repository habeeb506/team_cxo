import Modal from './Modal.jsx';
import Button from './Button.jsx';

/**
 * Reusable "are you sure?" confirmation, built on Modal. Every
 * destructive or hard-to-undo action (delete, revoke, archive) across
 * every module uses this instead of a bespoke confirm popup.
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
