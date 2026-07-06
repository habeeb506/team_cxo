import { useCallback, useState } from 'react';

/**
 * Generic boolean toggle — modal open/close, sidebar collapse, any
 * on/off UI state. Small, but used constantly enough to standardize.
 */
export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((current) => !current), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse }];
}
