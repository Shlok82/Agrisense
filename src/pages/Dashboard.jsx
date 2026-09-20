import { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  Bug,
  CloudRain,
  Droplets,
  Sprout,
  Thermometer,
  Wallet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Skeleton } from '../components/ui/Skeleton.jsx'
import { WeatherChart } from '../components/charts/WeatherChart.jsx'
import { useFarmer } from '../context/AppProviders.jsx'
import { useI18n } from '../context/AppProviders.jsx'
import { useWeather } from '../hooks/useWeather.js'
import { useAdvisory } from '../hooks/useAdvisory.js'
import { generateAdvisory } from '../utils/ai.js'
import { weatherCodeLabel } from '../utils/weatherApi.js'
import { STORAGE_KEYS } from '../utils/constants.js'

const iconMap = {
  sprout: Sprout,
  droplets: Droplets,
  bug: Bug,
  thermometer: Thermometer,
  'cloud-rain': CloudRain,
  wallet: Wallet,
  alert: AlertTriangle,
}

function loadPest() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.pestHistory)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function buildWeatherForAdvisory(currentPayload, dailyPayload) {
  const cw = currentPayload?.current
  const rainMm = dailyPayload?.precipitation_sum?.[0] ?? cw?.precipitation ?? 0
  const rainChance = Math.min(100, Math.round(Number(rainMm) * 12))
  return {
    temp: Math.round(cw?.temperature_2m ?? 0),
    humidity: Math.round(cw?.relative_humidity_2m ?? 0),
    rainChance,
    condition: weatherCodeLabel(cw?.weather_code),
  }
}

function mapSeverity(sev) {
  const s = String(sev || 'Info').toLowerCase()
  if (s.includes('critical')) return 'critical'
  if (s.includes('warning')) return 'warning'
  return 'info'
}

function mapCategoryToIcon(category) {
  const c = String(category || '').toLowerCase()
  if (c.includes('pest')) return 'bug'
  if (c.includes('irrigation')) return 'droplets'
  if (c.includes('fertilizer')) return 'sprout'
  if (c.includes('weather')) return 'cloud-rain'
  return 'sprout'
}

export function Dashboard() {
  const { t } = useI18n()
  const { effectiveProfile } = useFarmer()
  const location = useLocation()
  const [weatherRefresh, setWeatherRefresh] = useState(0)
  const weatherProfile = useMemo(
    () => ({ ...effectiveProfile, _refresh: weatherRefresh }),
    [effectiveProfile, weatherRefresh],
  )
  const { current, daily, loading, error } = useWeather(weatherProfile)
  const refetch = useCallback(() => setWeatherRefresh((x) => x + 1), [])
  const { items: advisoryCards, setItems: setAdvisoryItems } = useAdvisory()
  const [advisoryRequestLoading, setAdvisoryRequestLoading] = useState(false)
  const [advisoryRequestError, setAdvisoryRequestError] = useState(null)
  const [expanded, setExpanded] = useState({})
  const pestHistory = loadPest()

  useEffect(() => {
    if (location.hash === '#advisory') {
      const el = document.getElementById('advisory')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location])

  const health = computeHealth(pestHistory)
  const alerts = countAlerts(pestHistory)

  const irrigationEta = (() => {
    const base = effectiveProfile.stage === 'Flowering' ? 2 : 3
    return Math.max(0, base - (alerts > 0 ? 1 : 0))
  })()

  async function onGenerate() {
    setAdvisoryRequestLoading(true)
    setAdvisoryRequestError(null)
    try {
      const farmerProfile = effectiveProfile
      const profile =
        farmerProfile && Object.keys(farmerProfile).length
          ? {
              ...farmerProfile,
              landSize: farmerProfile?.landSize ?? farmerProfile?.landAcres,
            }
          : null
      const safeProfile = profile || {
        crop: 'Tomato',
        stage: 'Vegetative',
        soilType: 'Black',
        district: 'Pune',
        landSize: '3',
      }

      const builtWeather = buildWeatherForAdvisory(current, daily?.daily)
      const currentWeather = {
        temp: builtWeather?.temp ?? 28,
        humidity: builtWeather?.humidity ?? 65,
        rainChance: builtWeather?.rainChance ?? 20,
        condition: builtWeather?.condition || 'Partly Cloudy',
      }

      const rawList = await generateAdvisory(safeProfile, currentWeather)
      const arr = Array.isArray(rawList) ? rawList : []
      const stamp = new Date().toISOString()
      const batch = arr.map((card, idx) => {
        const iconKey =
          typeof card?.icon === 'string' && iconMap[card.icon]
            ? card.icon
            : mapCategoryToIcon(card?.category || 'General')
        return {
          id: String(card?.id ?? `${stamp}-${idx}`),
          createdAt: stamp,
          severity: mapSeverity(card?.severity || 'Info'),
          title: card?.title || 'Advisory',
          body: card?.advice || card?.body || 'Check your crop today.',
          icon: iconKey,
        }
      })
      setAdvisoryItems((prev) => [...batch, ...prev].slice(0, 40))
      toast.success(t('toast.advisory'))
    } catch (e) {
      console.error(e)
      setAdvisoryRequestError('Could not generate advisory. Please try again.')
      toast.error('Could not generate advisory. Please try again.')
    } finally {
      setAdvisoryRequestLoading(false)
    }
  }

  const currentWeather = current?.current
  const code = currentWeather?.weather_code

  return (
    <PageWrapper title={t('dashboard.title')}>
      {error ? (
        <Card className="border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-50">
          <p className="text-sm font-semibold">{t('common.error')}</p>
          <p className="mt-1 text-sm opacity-80">{error}</p>
          <Button type="button" className="mt-3" variant="outline" onClick={refetch}>
            {t('common.retry')}
          </Button>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label={t('dashboard.title')}>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
            {t('dashboard.overview.weather')}
          </p>
          {loading ? (
            <Skeleton className="mt-3 h-24 w-full" />
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-3xl font-black">{Math.round(currentWeather?.temperature_2m ?? 0)}°C</p>
              <p className="text-sm text-black/70 dark:text-white/70">{weatherCodeLabel(code)}</p>
              <p className="text-xs text-black/60 dark:text-white/60">
                Humidity {Math.round(currentWeather?.relative_humidity_2m ?? 0)}% · Wind{' '}
                {Math.round(currentWeather?.wind_speed_10m ?? 0)} km/h · Rain{' '}
                {currentWeather?.precipitation ?? 0} mm
              </p>
            </div>
          )}
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
            {t('dashboard.overview.health')}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Radial value={health} />
            <div>
              <p className="text-3xl font-black">{health}</p>
              <p className="text-xs text-black/60 dark:text-white/60">Based on scouting cadence and recent leaf checks</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
            {t('dashboard.overview.irrigation')}
          </p>
          <p className="mt-6 text-5xl font-black">{irrigationEta}</p>
          <p className="text-sm text-black/70 dark:text-white/70">Estimated safe gap before stressing root zone</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
            {t('dashboard.overview.alerts')}
          </p>
          <p className="mt-6 text-5xl font-black">{alerts}</p>
          <p className="text-sm text-black/70 dark:text-white/70">Pest or disease follow-ups pending review</p>
        </Card>
      </section>

      <section id="advisory" className="space-y-4 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{t('dashboard.advisory.title')}</h2>
          <Button type="button" variant="accent" onClick={onGenerate} disabled={advisoryRequestLoading}>
            {t('dashboard.advisory.generate')}
          </Button>
        </div>
        <div className="grid gap-4">
          {advisoryRequestError ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
              {advisoryRequestError}
            </p>
          ) : null}
          {advisoryRequestLoading ? (
            <>
              <Card>
                <Skeleton className="h-28 w-full" />
              </Card>
              <Card>
                <Skeleton className="h-28 w-full" />
              </Card>
              <Card>
                <Skeleton className="h-28 w-full" />
              </Card>
            </>
          ) : null}
          {!advisoryRequestLoading &&
          Array.isArray(advisoryCards) &&
          advisoryCards.length > 0 ? (
            advisoryCards.map((card, idx) => {
              const safeId = String(card?.id ?? `advisory-${idx}-${card?.createdAt || ''}`)
              const safeItem = {
                id: safeId,
                icon: card?.icon || '🌿',
                severity: card?.severity || 'info',
                title: card?.title || 'Advisory',
                body: card?.advice || card?.body || 'Check your crop today.',
                category: card?.category || 'General',
              }
              return (
                <motion.div
                  key={safeId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <AdvisoryCard
                    item={safeItem}
                    expanded={!!expanded[safeId]}
                    onToggle={() => setExpanded((s) => ({ ...s, [safeId]: !s[safeId] }))}
                    t={t}
                  />
                </motion.div>
              )
            })
          ) : null}
          {!advisoryRequestLoading &&
          (!Array.isArray(advisoryCards) || advisoryCards.length === 0) ? (
            <div className="rounded-2xl border border-black/5 bg-white/70 p-5 text-sm text-black/70 dark:border-white/10 dark:bg-[#1a4731]/35 dark:text-white/70">
              Click Generate Today&apos;s Advisory to get started
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">{t('dashboard.forecast.title')}</h3>
          {loading ? <Skeleton className="mt-4 h-64 w-full" /> : <WeatherChart daily={daily?.daily} />}
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">{t('dashboard.timeline.title')}</h3>
          <GrowthTimeline stage={effectiveProfile.stage} />
        </Card>
      </section>
    </PageWrapper>
  )
}

function AdvisoryCard({ item, expanded, onToggle, t }) {
  const Icon = iconMap[item?.icon] || Sprout
  const sev = item?.severity || 'info'
  const tone = sev === 'critical' ? 'critical' : sev === 'warning' ? 'warning' : 'info'
  const sevLabel =
    sev === 'critical'
      ? t('severity.critical')
      : sev === 'warning'
        ? t('severity.warning')
        : t('severity.info')
  return (
    <Card className="hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-wrap items-start gap-3">
        <div className="rounded-xl bg-[#1a4731]/10 p-3 text-[#1a4731] dark:bg-white/10 dark:text-[#fafaf7]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={tone === 'critical' ? 'critical' : tone === 'warning' ? 'warning' : 'info'}>{sevLabel}</Badge>
            <h4 className="text-base font-semibold">{item?.title || 'Advisory'}</h4>
          </div>
          <p className={`text-sm leading-relaxed text-black/80 dark:text-white/80 ${expanded ? '' : 'line-clamp-3'}`}>
            {item?.body || item?.advice || 'Check your crop today.'}
          </p>
          <Button type="button" variant="ghost" className="px-0" onClick={onToggle} aria-expanded={expanded}>
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
                <span>{t('common.close')}</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                <span>{t('dashboard.advisory.readmore')}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function Radial({ value }) {
  const r = 36
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  const color = value > 75 ? '#16a34a' : value > 55 ? '#f59e0b' : '#ef4444'
  return (
    <svg width="96" height="96" viewBox="0 0 100 100" aria-label={`Crop health ${value} percent`}>
      <circle cx="50" cy="50" r={r} stroke="rgba(0,0,0,0.08)" strokeWidth="10" fill="none" />
      <circle
        cx="50"
        cy="50"
        r={r}
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GrowthTimeline({ stage }) {
  const steps = ['Sowing', 'Vegetative', 'Flowering', 'Harvest']
  const tasks = {
    Sowing: 'Verify seed spacing, starter moisture, and bird damage along borders.',
    Vegetative: 'Scout for mites and early blight; maintain steady soil moisture without waterlogging.',
    Flowering: 'Reduce nitrogen pushes; watch for blossom-end rot triggers and wind lodging.',
    Harvest: 'Plan staggered picking windows and field hygiene to protect fruit quality.',
  }
  return (
    <ol className="mt-4 space-y-4">
      {steps.map((s) => {
        const active = s === stage
        return (
          <li key={s} className="flex gap-3">
            <div
              className={`mt-1 h-3 w-3 rounded-full ${active ? 'bg-[#f59e0b]' : 'bg-black/15 dark:bg-white/20'}`}
              aria-hidden="true"
            />
            <div>
              <p className={`text-sm font-semibold ${active ? 'text-[#1a4731] dark:text-[#fafaf7]' : ''}`}>{s}</p>
              <p className="text-xs text-black/65 dark:text-white/65">{tasks[s]}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function computeHealth(history) {
  let score = 88
  const recent = history.slice(0, 3)
  recent.forEach((h) => {
    if (h.healthy) score += 2
    else if (h.severity === 'High') score -= 12
    else if (h.severity === 'Medium') score -= 7
    else score -= 3
  })
  return Math.max(35, Math.min(100, Math.round(score)))
}

function countAlerts(history) {
  return history.filter((h) => !h.healthy && h.severity !== 'Low').length
}
