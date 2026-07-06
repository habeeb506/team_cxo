import { Handle, Position } from '@xyflow/react';

function initials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * The org chart's person card. `data` is a cxo_teams record plus
 * `color` (the group's fixed categorical hue, see orgChartColors.js) --
 * used only as a left-border accent, never as the text color, so group
 * identity never depends on color alone (see OrgChartLegend.jsx for the
 * text-labeled legend that makes it a secondary encoding, not the only
 * one).
 */
export default function OrgChartNode({ data }) {
  return (
    <div
      className="flex w-[220px] items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm"
      style={{ borderLeftWidth: 4, borderLeftColor: data.color }}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-slate-300" />

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
        {initials(data.name)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{data.name}</p>
        <p className="truncate text-xs text-slate-500">{data.designation}</p>
      </div>

      <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
        {data.level}
      </span>

      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-slate-300" />
    </div>
  );
}
