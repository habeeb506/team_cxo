import { cn } from '../../utils/cn.js';

/**
 * A small set of checkboxes acting as a multi-select — used for fields
 * with a short, fixed list of options (e.g. permission actions) where a
 * native multi-select `<select>` would be poor UX.
 */
export default function CheckboxGroup({ label, options = [], value = [], onChange, error, className }) {
  const toggle = (optionValue) => {
    const next = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];
    onChange(next);
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-1.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={() => toggle(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
