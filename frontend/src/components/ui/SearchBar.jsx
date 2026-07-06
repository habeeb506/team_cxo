import { useEffect, useState } from 'react';

import Input from './Input.jsx';
import useDebounce from '../../hooks/useDebounce.js';

/**
 * Debounced search input. Every list page wires this to
 * useApiResource's setSearch instead of re-implementing debounce logic.
 */
export default function SearchBar({ onSearch, placeholder = 'Search...', debounceMs = 400, className }) {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    onSearch(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <Input
      type="search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}
