import { forwardRef } from 'react';

import { cn } from '../../utils/cn.js';

/**
 * Base select input, matching Input's label/error pattern. Every form
 * or filter bar with an enum-like field (status, level, category...)
 * should build on this rather than a raw <select>.
 */
const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className, id, ...props },
  ref,
) {
  const selectId = id || props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={cn(
          'rounded-md border bg-white px-3 py-2 text-sm shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          error ? 'border-red-500' : 'border-slate-300',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

export default Select;
