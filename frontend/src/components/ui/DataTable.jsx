import Spinner from './Spinner.jsx';
import EmptyState from './EmptyState.jsx';
import { cn } from '../../utils/cn.js';

const defaultGetRowId = (row) => row.id ?? row._id;

// Pins a column to the right edge of the table's own scroll container
// (the `overflow-x-auto` div below) so it stays visible while every
// other column scrolls underneath it -- used for the management pages'
// View/Edit/Delete actions column (see components/management/ManagementPage.jsx),
// which shouldn't disappear off-screen when a table has more data
// columns than fit the viewport. `bg-white` keeps scrolled-under content
// from showing through; `group-hover:bg-slate-50` on the body cell keeps
// it in sync with the row's own hover background instead of looking
// like a separate, unhovered strip.
const STICKY_RIGHT_CLASSES = 'sticky right-0 z-10 bg-white shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.15)]';

/**
 * Generic tabular data renderer, driven entirely by a `columns` config
 * ({ key, header, render?, sticky? }) and a `rows` array. This is the
 * building block every future list/report/dashboard table is built
 * from — no feature should hand-roll a <table>.
 *
 * A column with `sticky: 'right'` stays pinned to the right of the
 * table's horizontal scroll area instead of scrolling away with the
 * rest of the row -- see STICKY_RIGHT_CLASSES above.
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
              <th
                key={column.key}
                className={cn('px-3 py-2 font-medium', column.sticky === 'right' && STICKY_RIGHT_CLASSES)}
              >
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
                className={cn('group border-b border-slate-100', 'hover:bg-slate-50', getRowClassName?.(row))}
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
                  <td
                    key={column.key}
                    className={cn(
                      'px-3 py-2 text-slate-700',
                      column.sticky === 'right' && cn(STICKY_RIGHT_CLASSES, 'group-hover:bg-slate-50'),
                    )}
                  >
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
