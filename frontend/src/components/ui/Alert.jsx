import { cn } from '../../utils/cn.js';

const VARIANT_CLASSES = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  error: 'bg-red-50 text-red-800 border-red-200',
};

/**
 * Inline banner for success/error/warning/info messages — form
 * submission results, empty-permission notices, etc. For transient
 * pop-up notifications use the Toast component + useToast hook instead.
 */
export default function Alert({ variant = 'info', title, children, className }) {
  return (
    <div className={cn('rounded-md border px-4 py-3 text-sm', VARIANT_CLASSES[variant], className)}>
      {title && <p className="font-medium">{title}</p>}
      {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
    </div>
  );
}
