import { Leaf } from 'lucide-react'
import { useI18n } from '../context/AppProviders.jsx'

export function DemoBanner() {
  const { t } = useI18n()
  return (
    <div
      className="flex items-start gap-3 border-b border-amber-400/40 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-500/10 dark:text-amber-50"
      role="status"
    >
      <Leaf className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="leading-snug">{t('demo.banner')}</p>
    </div>
  )
}
