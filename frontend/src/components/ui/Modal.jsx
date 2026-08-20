import { useEffect } from 'react';

import { cn } from '../../utils/cn.js';

/**
 * Base modal/dialog. Confirmation prompts, create/edit forms, and
 * future detail drill-downs all reuse this shell rather than each
 * building their own overlay + focus handling.
 *
 * The dialog box itself is capped to 85% of the viewport height
 * (`max-h-[85vh]`) with `flex flex-col` -- the title and footer stay
 * put (`flex-shrink-0`) while only the middle `children` area scrolls
 * (`overflow-y-auto`). Previously nothing here capped the box's height
 * at all, so a form with enough fields (e.g. Team Members' create/edit
 * form, once it grew to include Status *and* Time Slot) could render
 * taller than the actual screen with no way to scroll down to see its
 * own remaining fields or Save/Cancel buttons -- this fixes that for
 * every modal in the app, not just that one form.
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
        className={cn('flex max-h-[85vh] w-full max-w-md flex-col rounded-lg bg-white shadow-xl', className)}
      >
        {title && (
          <div className="flex-shrink-0 border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          </div>
        )}
        <div className="overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="flex flex-shrink-0 justify-end gap-2 border-t border-slate-200 px-4 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
