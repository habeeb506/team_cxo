import { cn } from '../../utils/cn.js';

// Covers every status value used across tickets (open/in-progress/
// resolved/closed), tasks (todo/in-progress/done), and team members'
// daily roster support value (available/training/reconciliation/mfa/
// dlaunch/pto/epto/other) with one shared component, rather than each
// feature rendering its own colored pill.
const STATUS_COLOR_CLASSES = {
  open: 'bg-slate-100 text-slate-700',
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  done: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-600',
  available: 'bg-emerald-100 text-emerald-700',
  training: 'bg-blue-100 text-blue-700',
  reconciliation: 'bg-violet-100 text-violet-700',
  mfa: 'bg-fuchsia-100 text-fuchsia-700',
  dlaunch: 'bg-cyan-100 text-cyan-700',
  pto: 'bg-amber-100 text-amber-700',
  epto: 'bg-orange-100 text-orange-700',
  other: 'bg-slate-200 text-slate-600',
};

/**
 * Small colored pill for a status/priority-like string. Any future
 * resource with a status field reuses this instead of a new one-off
 * badge implementation. Color is always looked up from `status`; the
 * displayed text defaults to a title-cased version of it but can be
 * overridden with `label` for values CSS `capitalize` can't render
 * correctly on its own (e.g. 'mfa' needs to read "MFA", not "Mfa").
 */
export default function StatusBadge({ status, label }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        label ? '' : 'capitalize',
        STATUS_COLOR_CLASSES[status] || 'bg-slate-100 text-slate-700',
      )}
    >
      {label ?? status?.replace('-', ' ')}
    </span>
  );
}
