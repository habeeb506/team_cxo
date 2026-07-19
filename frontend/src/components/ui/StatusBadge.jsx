import { cn } from '../../utils/cn.js';

// Covers every status value used across tickets (open/in-progress/
// resolved/closed), tasks (todo/in-progress/done), and team members
// (active/inactive/on-leave/terminated) with one shared component,
// rather than each feature rendering its own colored pill.
const STATUS_COLOR_CLASSES = {
  open: 'bg-slate-100 text-slate-700',
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  done: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-600',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-200 text-slate-600',
  'on-leave': 'bg-amber-100 text-amber-700',
  terminated: 'bg-red-100 text-red-700',
};

/**
 * Small colored pill for a status/priority-like string. Any future
 * resource with a status field reuses this instead of a new one-off
 * badge implementation.
 */
export default function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        STATUS_COLOR_CLASSES[status] || 'bg-slate-100 text-slate-700',
      )}
    >
      {status?.replace('-', ' ')}
    </span>
  );
}
