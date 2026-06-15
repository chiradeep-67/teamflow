import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 hover:border-indigo-400',
  secondary: 'bg-transparent hover:bg-white/5 text-current border border-white/10 dark:border-white/10 dark:hover:border-white/20',
  ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-current border border-transparent',
  danger: 'bg-red-600 hover:bg-red-500 text-white border border-red-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-sm h-9',
  lg: 'px-5 py-2.5 text-base h-11',
  xl: 'px-6 py-3 text-base h-12',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'cursor-pointer select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
