import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar.jsx'
import { Button } from '../ui/Button.jsx'

export function AppShell() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-[100dvh] bg-[#fafaf7] text-[#1a4731] dark:bg-[#0b1610] dark:text-[#fafaf7]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-[100dvh] flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f2419]/70 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="px-3 py-2"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-sidebar"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-semibold">Menu</span>
          </Button>
          <p className="text-sm font-semibold">AgriSense</p>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
