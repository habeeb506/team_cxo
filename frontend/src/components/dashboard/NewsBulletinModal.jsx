import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

/**
 * Full-detail "View more" modal for one news bulletin. Sized close to
 * full-page (per the spec) rather than the default small dialog width
 * -- everything else (escape-to-close, overlay, focus container) is
 * inherited from the shared Modal.
 */
export default function NewsBulletinModal({ bulletin, onClose }) {
  if (!bulletin) return null;

  return (
    <Modal
      isOpen={Boolean(bulletin)}
      onClose={onClose}
      title={bulletin.title}
      className="max-h-[85vh] w-full max-w-3xl overflow-y-auto"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">
        {formatDateTime(bulletin.publishedAt)}
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{bulletin.description}</p>
      {bulletin.link && (
        <a
          href={bulletin.link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          Read more &rarr;
        </a>
      )}
    </Modal>
  );
}
