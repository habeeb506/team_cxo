import { useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '../../utils/cn.js';
import useClickOutside from '../../hooks/useClickOutside.js';

/**
 * Dropdown multi-select with a "Select all" toggle, used by the
 * Dashboard's Year/Month filter (see components/dashboard/YearMonthFilter.jsx).
 * Deliberately a dropdown rather than inline checkboxes (see
 * CheckboxGroup, used elsewhere for short fixed lists) since this sits
 * in a Card's compact `actions` slot next to the title -- a dozen
 * inline month checkboxes wouldn't fit there.
 *
 * `selected` is a string[] of `option.value`s. Whether "select all" and
 * "select none" mean the same thing is left to the caller (see
 * hooks/useYearMonthFilter.js, where both collapse to "no filter") --
 * this component just reports whatever's checked.
 */
export default function MultiSelect({ label, options = [], selected = [], onChange, placeholder = 'All' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectAllRef = useRef(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  const allSelected = options.length > 0 && selected.length === options.length;
  const noneSelected = selected.length === 0;

  if (selectAllRef.current) {
    selectAllRef.current.indeterminate = !allSelected && !noneSelected;
  }

  const summary = useMemo(() => {
    if (noneSelected || allSelected) return placeholder;
    if (selected.length <= 2) {
      return options
        .filter((option) => selected.includes(option.value))
        .map((option) => option.label)
        .join(', ');
    }
    return `${selected.length} selected`;
  }, [noneSelected, allSelected, selected, options, placeholder]);

  const toggleSelectAll = () => {
    onChange(allSelected ? [] : options.map((option) => option.value));
  };

  const toggleOption = (value) => {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm',
          'hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
        )}
      >
        {summary}
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 max-h-64 w-44 overflow-y-auto rounded-md border border-slate-200 bg-white p-2 shadow-lg">
          <label className="flex items-center gap-1.5 border-b border-slate-100 px-1 pb-2 text-xs font-medium text-slate-700">
            <input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
            Select all
          </label>
          <div className="mt-1 flex flex-col gap-1">
            {options.map((option) => (
              <label key={option.value} className="flex items-center gap-1.5 px-1 py-0.5 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
