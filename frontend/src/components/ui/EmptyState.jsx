/**
 * Placeholder shown when a list/table has no data — used by every
 * future list page (users, reports, notifications) instead of each
 * one writing its own "nothing here" markup.
 */
export default function EmptyState({ title = 'No data', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      {description && <p className="text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
