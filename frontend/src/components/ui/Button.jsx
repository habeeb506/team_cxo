import { cn } from '../../utils/cn.js';

const VARIANT_CLASSES = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-400',
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

/**
 * Base button used everywhere an action is triggered. New pages should
 * reuse this instead of styling raw <button> elements.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
