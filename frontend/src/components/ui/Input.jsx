import { forwardRef } from 'react';

import { cn } from '../../utils/cn.js';

/**
 * Base text input with a consistent label/error pattern. Every form
 * across every future module (auth, settings, reports filters) should
 * build on this rather than raw <input> markup.
 */
const Input = forwardRef(function Input({ label, error, className, id, ...props }, ref) {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          'rounded-md border px-3 py-2 text-sm shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          error ? 'border-red-500' : 'border-slate-300',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

export default Input;
