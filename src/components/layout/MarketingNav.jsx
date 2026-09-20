import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Sprout, Sun, Moon, Type } from 'lucide-react'
import { useI18n, useTheme } from '../../context/AppProviders.jsx'
import { Button } from '../ui/Button.jsx'

export function MarketingNav() {
  const { t, lang, setLang } = useI18n()
  const { theme, setTheme, fontSize, setFontSize } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition ${
        scrolled ? 'border-b border-black/5 bg-[#fafaf7]/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1610]/80' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold" aria-label="AgriSense home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a4731] text-[#fafaf7] dark:bg-[#fafaf7] dark:text-[#1a4731]">
            <Sprout className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base sm:text-lg">AgriSense</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex" aria-label="Primary">
          <NavLink to="/dashboard" className="hover:text-[#f59e0b]">
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/onboarding" className="hover:text-[#f59e0b]">
            {t('nav.onboarding')}
          </NavLink>
          <NavLink to="/privacy" className="hover:text-[#f59e0b]">
            {t('nav.privacy')}
          </NavLink>
        </nav>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <label className="flex items-center gap-1 text-xs font-semibold">
            <span className="hidden sm:inline">{t('nav.language')}</span>
            <select
              aria-label={t('nav.language')}
              className="rounded-lg border border-black/10 bg-white/80 px-2 py-1 text-xs dark:border-white/20 dark:bg-white/5"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="en">{t('lang.en')}</option>
              <option value="mr">{t('lang.mr')}</option>
              <option value="hi">{t('lang.hi')}</option>
            </select>
          </label>
          <Button
            type="button"
            variant="ghost"
            className="px-2 py-2"
            aria-label={`${t('nav.theme')}: ${theme === 'dark' ? t('theme.light') : t('theme.dark')}`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            <span className="hidden text-xs font-semibold sm:inline">
              {theme === 'dark' ? t('theme.light') : t('theme.dark')}
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="px-2 py-2"
            aria-label={`${t('nav.font')}: ${fontSize === 'large' ? t('nav.font.normal') : t('nav.font.large')}`}
            onClick={() => setFontSize(fontSize === 'large' ? 'normal' : 'large')}
          >
            <Type className="h-4 w-4" aria-hidden="true" />
            <span className="hidden text-xs font-semibold sm:inline">
              {fontSize === 'large' ? t('nav.font.normal') : t('nav.font.large')}
            </span>
          </Button>
          <Link
            to="/dashboard"
            className="hidden items-center justify-center rounded-xl bg-[#1a4731] px-4 py-2 text-sm font-semibold text-[#fafaf7] shadow-sm transition hover:bg-[#143824] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b] sm:inline-flex dark:bg-[#fafaf7] dark:text-[#1a4731] dark:hover:bg-[#e5e5dc]"
          >
            {t('nav.start')}
          </Link>
        </div>
      </div>
    </header>
  )
}
