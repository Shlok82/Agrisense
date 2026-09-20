import { useEffect, useMemo, useState, useCallback } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Skeleton } from '../components/ui/Skeleton.jsx'
import { useFarmer } from '../context/AppProviders.jsx'
import { useI18n } from '../context/AppProviders.jsx'
import { useWeather } from '../hooks/useWeather.js'
import { summarizeForecastForAi, weatherCodeLabel } from '../utils/weatherApi.js'
import { askGemini } from '../utils/ai.js'

export function Weather() {
  const { t, lang } = useI18n()
  const { effectiveProfile } = useFarmer()
  const [refresh, setRefresh] = useState(0)
  const profile = useMemo(() => ({ ...effectiveProfile, _refresh: refresh }), [effectiveProfile, refresh])
  const { current, daily, loading, error } = useWeather(profile)
  const [impact, setImpact] = useState([])
  const [impactLoading, setImpactLoading] = useState(false)
  const [impactError, setImpactError] = useState(null)

  const refetch = useCallback(() => setRefresh((x) => x + 1), [])

  const chartData =
    daily?.daily?.time?.map((date, i) => ({
      day: date.slice(5),
      max: daily.daily.temperature_2m_max?.[i] ?? 0,
      min: daily.daily.temperature_2m_min?.[i] ?? 0,
      rain: daily.daily.precipitation_sum?.[i] ?? 0,
    })) ?? []

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!daily?.daily) return
      setImpactLoading(true)
      setImpactError(null)
      try {
        const forecastSummary = summarizeForecastForAi(daily.daily)
        const prompt = `Crop: ${effectiveProfile.crop}. Stage: ${effectiveProfile.stage}. Preferred language context: ${lang}.

7-day forecast snapshot:
${forecastSummary}

Return ONLY a JSON array of exactly 4 short strings (each under 220 characters) with practical field recommendations (spray windows, drainage, lodging risk, heat stress). No markdown.`
        const raw = await askGemini(
          prompt,
          'You are an AgriSense field weather coach for India. Output must be valid JSON only: an array of 4 strings.',
        )
        const clean = raw.replace(/```json|```/g, '').trim()
        const arr = JSON.parse(clean)
        if (!cancelled) setImpact(Array.isArray(arr) ? arr : [])
      } catch (e) {
        if (!cancelled) {
          setImpactError(e.message || t('common.error'))
          setImpact([
            'If the AI service is offline, still avoid spraying immediately before forecast rain.',
            'Tie loose mulch before windy nights to protect young stems.',
            'Walk lower terraces after heavy rain to reopen drainage cuts.',
          ])
        }
      } finally {
        if (!cancelled) setImpactLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [daily, effectiveProfile.crop, effectiveProfile.stage, lang, t])

  const cw = current?.current
  const code = cw?.weather_code

  return (
    <PageWrapper title={t('weather.title')}>
      {error ? (
        <Card className="border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-50">
          <p className="text-sm font-semibold">{t('common.error')}</p>
          <p className="text-sm opacity-80">{error}</p>
          <Button type="button" className="mt-3" variant="outline" onClick={refetch}>
            {t('common.retry')}
          </Button>
        </Card>
      ) : null}

      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#f59e0b]/20 blur-2xl" />
        <div className="relative grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
              {t('weather.today')}
            </p>
            {loading ? (
              <Skeleton className="mt-4 h-32 w-full" />
            ) : (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <WeatherGlyph code={code} />
                  <div>
                    <p className="text-5xl font-black">{Math.round(cw?.temperature_2m ?? 0)}°C</p>
                    <p className="text-sm text-black/70 dark:text-white/70">{weatherCodeLabel(code)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-black/70 dark:text-white/70">
                  Feels steady for field work in {effectiveProfile.district} block — watch leaf wetness if nights stay calm.
                </p>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label={t('weather.uv')} value={cw?.uv_index != null ? cw.uv_index.toFixed(1) : '—'} />
            <MiniStat label={t('weather.humidity')} value={`${Math.round(cw?.relative_humidity_2m ?? 0)}%`} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">7-day max / min temperature</h3>
          {loading ? <Skeleton className="mt-4 h-64 w-full" /> : null}
          {!loading && chartData.length ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="°C" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="max" name="Max" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="min" name="Min" stroke="#1a4731" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Rainfall outlook (mm)</h3>
          {loading ? <Skeleton className="mt-4 h-64 w-full" /> : null}
          {!loading && chartData.length ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="rain" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold">{t('weather.impact')}</h3>
        {impactLoading ? <Skeleton className="mt-4 h-20 w-full" /> : null}
        {impactError && !impactLoading ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">{impactError}</p> : null}
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-black/80 dark:text-white/80">
          {impact.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </Card>
    </PageWrapper>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  )
}

function WeatherGlyph({ code }) {
  const isRain = code != null && [61, 63, 65, 80, 81, 82, 95].includes(code)
  const isCloud = code != null && [2, 3, 45, 48].includes(code)
  if (isRain) {
    return (
      <div className="relative h-20 w-20" aria-hidden="true">
        <div className="absolute inset-0 animate-pulse rounded-full bg-sky-400/30 blur-xl" />
        <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-sky-500/20 text-4xl">🌧️</div>
      </div>
    )
  }
  if (isCloud) {
    return (
      <div className="relative h-20 w-20" aria-hidden="true">
        <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-slate-400/20 text-4xl">☁️</div>
      </div>
    )
  }
  return (
    <div className="relative h-20 w-20" aria-hidden="true">
      <div className="absolute inset-2 animate-pulse rounded-full bg-amber-300/40 blur-md" />
      <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-amber-400/25 text-4xl">☀️</div>
    </div>
  )
}
