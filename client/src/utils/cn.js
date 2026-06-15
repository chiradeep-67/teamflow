/**
 * Merges class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
