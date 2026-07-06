import Spinner from './Spinner.jsx';
import EmptyState from './EmptyState.jsx';
import { cn } from '../../utils/cn.js';

const defaultGetRowId = (row) => row.id ?? row._id;

/**
 * Generic tabular data renderer, driven entirely by a `columns` config
 * ({ key, header, render? }) and a `rows` array. This is the building
 * block every future list/report/dashboard table is built from —
 * no feature should hand-roll a <table>.
 *
 * Optional row selection (for bulk actions): pass `selectable`,
 * `selectedIds` (a Set), `onToggleRow(id)`, and `onToggleAll()` — see
 * hooks/useRowSelection.js. Omitted entirely when `selectable` is false.
 *
 * Optional per-row styling/refs: `getRowClassName(row)` (e.g. to
 * highlight "your" row in a leaderboard) and `getRowRef(row)` (e.g. to
 * scroll a specific row into view on load) — both no-ops unless passed.
 */
export default function DataTable({
  columns,
  rows,
  isLoading,
  emptyMessage = 'No records found',
  selectable = false,
  selectedIds,
  onToggleRow,
  onToggleAll,
  getRowId = defaultGetRowId,
  getRowClassName,
  getRowRef,
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  const allSelected = selectable && rows.length > 0 && rows.every((row) => selectedIds?.has(getRowId(row)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            {selectable && (
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const rowId = getRowId(row) ?? rowIndex;
            return (
              <tr
                key={rowId}
                ref={getRowRef ? getRowRef(row) : undefined}
                className={cn('border-b border-slate-100', 'hover:bg-slate-50', getRowClassName?.(row))}
              >
                {selectable && (
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds?.has(rowId) ?? false}
                      onChange={() => onToggleRow(rowId)}
                      aria-label="Select row"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 text-slate-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
