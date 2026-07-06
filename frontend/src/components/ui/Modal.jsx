import { useEffect } from 'react';

import { cn } from '../../utils/cn.js';

/**
 * Base modal/dialog. Confirmation prompts, create/edit forms, and
 * future detail drill-downs all reuse this shell rather than each
 * building their own overlay + focus handling.
 */
export default function Modal({ isOpen, onClose, title, children, footer, className }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={cn('w-full max-w-md rounded-lg bg-white shadow-xl', className)}
      >
        {title && (
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          </div>
        )}
        <div className="p-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">{footer}</div>}
      </div>
    </div>
  );
}
