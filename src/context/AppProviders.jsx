import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS, DEMO_PROFILE } from '../utils/constants.js'
import { translate } from '../utils/translations.js'
import { getProfile } from '../utils/apiClient.js'

const ThemeCtx = createContext(null)
const I18nCtx = createContext(null)
const FarmerCtx = createContext(null)
const ConsentCtx = createContext(null)

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function AppProviders({ children }) {
  const [theme, setTheme] = useState(() => readJson(STORAGE_KEYS.theme, 'light'))
  const [lang, setLang] = useState(() => readJson(STORAGE_KEYS.lang, 'en'))
  const [fontSize, setFontSize] = useState(() => readJson(STORAGE_KEYS.fontSize, 'normal'))
  const [profile, setProfileState] = useState(() => {
    // Read from the legacy key or the new getProfile function
    const legacy = readJson(STORAGE_KEYS.profile, null)
    if (legacy) return legacy
    return getProfile()
  })
  const [consent, setConsentState] = useState(() => readJson(STORAGE_KEYS.consent, false))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme))
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(lang))
    document.documentElement.lang = lang === 'mr' ? 'mr' : lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fontSize, JSON.stringify(fontSize))
    document.documentElement.classList.toggle('text-lg', fontSize === 'large')
  }, [fontSize])

  const setProfile = useCallback((next) => {
    setProfileState(next)
    if (next) {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(next))
      localStorage.setItem('farmerProfile', JSON.stringify(next))
    } else {
      localStorage.removeItem(STORAGE_KEYS.profile)
      localStorage.removeItem('farmerProfile')
    }
  }, [])

  const setConsent = useCallback((v) => {
    setConsentState(v)
    localStorage.setItem(STORAGE_KEYS.consent, JSON.stringify(v))
  }, [])

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang])

  const effectiveProfile = useMemo(() => {
    const base = { ...DEMO_PROFILE }
    if (!profile) return { ...base, demo: true }
    return {
      ...base,
      ...profile,
      lat: profile.lat ?? base.lat,
      lon: profile.lon ?? base.lon,
      demo: false,
    }
  }, [profile])

  const themeValue = useMemo(
    () => ({ theme, setTheme, fontSize, setFontSize }),
    [theme, fontSize],
  )
  const i18nValue = useMemo(() => ({ lang, setLang, t }), [lang, t])
  const farmerValue = useMemo(
    () => ({ profile, setProfile, effectiveProfile }),
    [profile, setProfile, effectiveProfile],
  )
  const consentValue = useMemo(() => ({ consent, setConsent }), [consent, setConsent])

  return (
    <ThemeCtx.Provider value={themeValue}>
      <I18nCtx.Provider value={i18nValue}>
        <FarmerCtx.Provider value={farmerValue}>
          <ConsentCtx.Provider value={consentValue}>{children}</ConsentCtx.Provider>
        </FarmerCtx.Provider>
      </I18nCtx.Provider>
    </ThemeCtx.Provider>
  )
}

export function useTheme() {
  const v = useContext(ThemeCtx)
  if (!v) throw new Error('useTheme outside provider')
  return v
}

export function useI18n() {
  const v = useContext(I18nCtx)
  if (!v) throw new Error('useI18n outside provider')
  return v
}

export function useFarmer() {
  const v = useContext(FarmerCtx)
  if (!v) throw new Error('useFarmer outside provider')
  return v
}

export function useConsent() {
  const v = useContext(ConsentCtx)
  if (!v) throw new Error('useConsent outside provider')
  return v
}
