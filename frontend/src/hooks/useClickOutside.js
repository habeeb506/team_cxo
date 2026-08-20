import { useEffect } from 'react';

/**
 * Calls `onOutsideClick` when a pointer-down happens outside `ref`'s
 * element. Used to close dropdown/popover UI (see
 * components/ui/MultiSelect.jsx) without every consumer re-implementing
 * the same document-listener boilerplate. Pass `isActive = false` to
 * skip attaching the listener entirely (e.g. while a popover is closed).
 */
export default function useClickOutside(ref, onOutsideClick, isActive = true) {
  useEffect(() => {
    if (!isActive) return undefined;

    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick(event);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [ref, onOutsideClick, isActive]);
}
