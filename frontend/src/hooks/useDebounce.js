import { useEffect, useState } from 'react';

/**
 * Debounces a fast-changing value (search input, filter field) so
 * dependent effects (API calls) only run after the user pauses typing.
 *
 * Usage: const debouncedSearch = useDebounce(search, 300);
 */
export default function useDebounce(value, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
