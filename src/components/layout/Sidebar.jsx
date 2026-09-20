import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Sparkles,
  ScanLine,
  CloudSun,
  Droplets,
  IndianRupee,
  FileText,
  Sprout,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../context/AppProviders.jsx'

const items = (t) => [
  { to: '/dashboard', label: t('sidebar.overview'), icon: LayoutDashboard },
  { to: '/dashboard#advisory', label: t('sidebar.advisory'), icon: Sparkles },
  { to: '/pest-detection', label: t('sidebar.pest'), icon: ScanLine },
  { to: '/weather', label: t('sidebar.weather'), icon: CloudSun },
  { to: '/irrigation', label: t('sidebar.irrigation'), icon: Droplets },
  { to: '/cost', label: t('sidebar.cost'), icon: IndianRupee },
  { to: '/reports', label: t('sidebar.reports'), icon: FileText },
]

export function Sidebar({ open, onClose }) {
  const { t } = useI18n()
  const links = items(t)

  const panel = (
    <aside
      id="mobile-sidebar"
      className="flex h-full w-72 flex-col border-r border-black/5 bg-white/70 px-4 py-6 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f2419]/80"
      aria-label="Primary"
    >
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a4731] text-[#fafaf7] dark:bg-[#fafaf7] dark:text-[#1a4731]">
          <Sprout aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/60">AgriSense</p>
          <p className="text-sm font-semibold text-[#1a4731] dark:text-[#fafaf7]">Farm cockpit</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1" aria-label="Dashboard sections">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/10 ${
                isActive && !to.includes('#')
                  ? 'bg-[#1a4731] text-[#fafaf7] shadow-sm dark:bg-[#fafaf7] dark:text-[#1a4731]'
                  : 'text-[#1a4731] dark:text-[#fafaf7]'
              }`
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <p className="mt-6 px-2 text-xs text-black/50 dark:text-white/50">
        Icon labels always show for clarity and screen reader parity.
      </p>
    </aside>
  )

  return (
    <>
      <div className="hidden lg:block">{panel}</div>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => onClose?.()}
            />
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              className="absolute left-0 top-0 h-full"
            >
              {panel}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
