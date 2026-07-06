import { useCallback, useState } from 'react';

/**
 * Tracks a set of selected row ids for bulk actions (e.g. bulk delete).
 * Every table page that supports selection uses this instead of
 * hand-rolling Set/array state.
 */
export default function useRowSelection() {
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const toggleRow = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((rows, getRowId) => {
    setSelectedIds((prev) => {
      const allSelected = rows.length > 0 && rows.every((row) => prev.has(getRowId(row)));
      return allSelected ? new Set() : new Set(rows.map(getRowId));
    });
  }, []);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  return { selectedIds, toggleRow, toggleAll, clear };
}
