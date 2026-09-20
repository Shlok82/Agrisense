const styles = {
  info: 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-100',
  warning: 'bg-amber-500/20 text-amber-950 dark:text-amber-100',
  critical: 'bg-rose-600/20 text-rose-950 dark:text-rose-50',
  neutral: 'bg-black/5 text-[#1a4731] dark:bg-white/10 dark:text-[#fafaf7]',
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[tone] || styles.neutral} ${className}`}
    >
      {children}
    </span>
  )
}
