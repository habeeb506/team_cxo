/**
 * Merges conditional class names, skipping falsy values. Used by every
 * UI component instead of ad-hoc template-string concatenation.
 *
 * Usage: cn('px-4 py-2', isActive && 'bg-blue-600', className)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
