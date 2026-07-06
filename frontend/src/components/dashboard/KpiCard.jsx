import Card from '../ui/Card.jsx';

/**
 * Small metric tile (a count + a short breakdown line). Used by the
 * Individual Contribution panel today (Tickets, Tasks); any future
 * dashboard KPI reuses this instead of a one-off card layout.
 */
export default function KpiCard({ label, value, subtitle, icon: Icon }) {
  return (
    <Card className="flex items-center gap-3">
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
    </Card>
  );
}
