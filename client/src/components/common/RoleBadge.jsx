import { ROLE_LABELS, ROLE_STYLES } from '../../utils/permissions';
import { cn } from '../../utils/cn';

export function RoleBadge({ role, size = 'sm' }) {
  if (!role) return null;
  const style = ROLE_STYLES[role] ?? ROLE_STYLES.member;
  const label = ROLE_LABELS[role] ?? role;

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-md border',
      style.bg, style.text, style.border,
      sizes[size]
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
      {label}
    </span>
  );
}
