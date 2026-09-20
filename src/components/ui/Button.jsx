export function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary:
      'bg-[#1a4731] text-[#fafaf7] hover:bg-[#143824] focus-visible:outline-[#f59e0b] dark:bg-[#fafaf7] dark:text-[#1a4731]',
    accent:
      'bg-[#f59e0b] text-[#1a4731] hover:bg-[#d97706] focus-visible:outline-[#1a4731]',
    ghost:
      'bg-transparent text-[#1a4731] hover:bg-black/5 dark:text-[#fafaf7] dark:hover:bg-white/10',
    outline:
      'border border-[#1a4731]/30 bg-white/40 text-[#1a4731] backdrop-blur hover:border-[#1a4731]/60 dark:border-white/20 dark:text-[#fafaf7] dark:bg-white/5',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
