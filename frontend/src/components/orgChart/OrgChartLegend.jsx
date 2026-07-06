/**
 * Text-labeled swatch list for the org chart's group color-coding --
 * the "relief" that keeps color a secondary encoding rather than the
 * only way to tell departments apart (see orgChartColors.js).
 */
export default function OrgChartLegend({ groupColorMap }) {
  if (groupColorMap.size === 0) return null;

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg border border-slate-200 bg-white/95 p-2.5 shadow-sm backdrop-blur-sm">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Group</p>
      <ul className="space-y-1">
        {[...groupColorMap.entries()].map(([group, color]) => (
          <li key={group} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            {group}
          </li>
        ))}
      </ul>
    </div>
  );
}
