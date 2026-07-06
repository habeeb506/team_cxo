import { cn } from '../../utils/cn.js';

const VARIANT_CLASSES = {
  info: 'bg-slate-900',
  success: 'bg-emerald-600',
  warning: 'bg-amber-600',
  error: 'bg-red-600',
};

/**
 * Single transient notification bubble. Rendered by ToastContext —
 * feature code triggers these via the useToast hook, never by
 * importing this component directly.
 */
export default function Toast({ message, variant = 'info', onDismiss }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-md px-4 py-2.5 text-sm text-white shadow-lg',
        VARIANT_CLASSES[variant],
      )}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="ml-auto text-white/70 hover:text-white"
      >
        &times;
      </button>
    </div>
  );
}
