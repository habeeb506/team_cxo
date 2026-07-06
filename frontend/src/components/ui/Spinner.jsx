import { cn } from '../../utils/cn.js';

const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

/**
 * Standard loading indicator. Any data-fetching state (list pages,
 * dashboards, form submits) should render this instead of ad-hoc
 * "Loading..." text.
 */
export default function Spinner({ size = 'md', className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-slate-300 border-t-blue-600',
        SIZE_CLASSES[size],
        className,
      )}
    />
  );
}
