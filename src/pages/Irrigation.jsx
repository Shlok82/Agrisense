import { useMemo, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { MoistureChart } from '../components/charts/MoistureChart.jsx'
import { estimateNextIrrigation, simulateMoistureSeries } from '../utils/irrigationLogic.js'
import { summarizeForecastForAi } from '../utils/weatherApi.js'
import { getIrrigationTip } from '../utils/ai.js'
import { useWeather } from '../hooks/useWeather.js'
import { STORAGE_KEYS } from '../utils/constants.js'
import { useFarmer } from '../context/AppProviders.jsx'
import { useI18n } from '../context/AppProviders.jsx'
import { apiClient } from '../utils/apiClient.js'

function loadLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.irrigationLog)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLog(rows) {
  localStorage.setItem(STORAGE_KEYS.irrigationLog, JSON.stringify(rows))
}

export function Irrigation() {
  const { t } = useI18n()
  const { effectiveProfile } = useFarmer()
  const { daily } = useWeather(effectiveProfile)
  const [moisture, setMoisture] = useState(58)
  const [last, setLast] = useState(() => new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10))
  const [log, setLog] = useState([])
  
  useEffect(() => {
    if (effectiveProfile?._id) {
      apiClient.getIrrigationLogsByFarmerId(effectiveProfile._id).then(res => {
        setLog(res.map(r => ({
          id: r._id,
          date: r.date.slice(0, 10),
          duration: `${r.duration} min`,
          method: r.method,
          water: `${r.waterUsed} L`
        })))
      })
    } else {
      setLog(loadLog())
    }
  }, [effectiveProfile?._id])
  const [tip, setTip] = useState('')
  const [tipLoading, setTipLoading] = useState(false)
  const [tipError, setTipError] = useState(null)

  const plan = useMemo(
    () =>
      estimateNextIrrigation({
        moisturePct: moisture,
        lastIrrigationDate: last,
        crop: effectiveProfile.crop,
        stage: effectiveProfile.stage,
        irrigation: effectiveProfile.irrigation,
      }),
    [effectiveProfile.crop, effectiveProfile.irrigation, effectiveProfile.stage, last, moisture],
  )

  const series = useMemo(() => simulateMoistureSeries({ startMoisture: moisture }), [moisture])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setTipLoading(true)
      setTipError(null)
      try {
        const forecastSnippet = daily?.daily
          ? summarizeForecastForAi(daily.daily).slice(0, 900)
          : 'Forecast not available.'
        const weatherBlock = `${forecastSnippet}\nPlanned next irrigation window: ${plan.nextDate}. Indicative water need: ${plan.litresPerAcre} L/acre. System: ${effectiveProfile.irrigation}.`
        const tipText = await getIrrigationTip(
          effectiveProfile.crop,
          effectiveProfile.stage,
          moisture,
          weatherBlock,
        )
        if (!cancelled) setTip(tipText)
      } catch (e) {
        if (!cancelled) {
          setTipError(e.message || t('common.error'))
          setTip(
            'Pulse irrigation in short cycles on hot afternoons to reduce runoff on sloping tomato beds.',
          )
        }
      } finally {
        if (!cancelled) setTipLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [daily, effectiveProfile.crop, effectiveProfile.irrigation, effectiveProfile.stage, last, moisture, plan, t])

  const [draft, setDraft] = useState({
    date: new Date().toISOString().slice(0, 10),
    duration: '45 min',
    method: effectiveProfile.irrigation,
    water: '12,000 L',
  })

  async function addLog() {
    if (effectiveProfile?._id) {
      try {
        const payload = {
          farmerId: effectiveProfile._id,
          date: draft.date,
          waterUsed: Number(draft.water.replace(/\\D/g, '')) || 0,
          method: draft.method,
          duration: parseInt(draft.duration) || 45
        }
        const newLog = await apiClient.createIrrigationLog(payload)
        const uiRow = {
          id: newLog._id,
          date: newLog.date.slice(0, 10),
          duration: `${newLog.duration} min`,
          method: newLog.method,
          water: `${newLog.waterUsed} L`
        }
        setLog([uiRow, ...log].slice(0, 20))
        toast.success(t('toast.saved'))
      } catch (err) {
        toast.error('Error saving to DB')
      }
    } else {
      const row = { id: crypto.randomUUID(), ...draft }
      const next = [row, ...log].slice(0, 20)
      setLog(next)
      saveLog(next)
      toast.success(t('toast.saved'))
    }
  }

  return (
    <PageWrapper title={t('irrigation.title')}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <label className="block text-sm font-semibold">
            {t('irrigation.moisture')}
            <input
              type="range"
              min="0"
              max="100"
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="mt-2 w-full accent-[#f59e0b]"
              aria-valuetext={`${moisture} percent`}
            />
            <span className="text-xs text-black/60 dark:text-white/60">{moisture}%</span>
          </label>
          <label className="block text-sm font-semibold">
            {t('irrigation.last')}
            <input
              type="date"
              value={last}
              onChange={(e) => setLast(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0f2419]"
            />
          </label>
          <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
              {t('irrigation.next')}
            </p>
            <p className="mt-2 text-2xl font-black">{plan.nextDate}</p>
            <p className="text-xs text-black/60 dark:text-white/60">In about {plan.daysToNext} days at current trend</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/5 p-3 text-sm dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
                {t('irrigation.water')}
              </p>
              <p className="mt-2 text-xl font-bold">{plan.litresPerAcre.toLocaleString('en-IN')} L</p>
            </div>
            <div className="rounded-2xl border border-black/5 p-3 text-sm dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
                {t('irrigation.bestTime')}
              </p>
              <p className="mt-2 text-sm font-semibold">{plan.bestWindow}</p>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Soil moisture outlook (simulated)</h3>
          <MoistureChart points={series} />
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold">{t('irrigation.tip')}</h3>
        {tipLoading ? <p className="mt-2 text-sm text-black/60 dark:text-white/60">{t('common.loading')}</p> : null}
        {tipError ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">{tipError}</p> : null}
        <p className="mt-2 text-sm leading-relaxed text-black/80 dark:text-white/80">{tip}</p>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">{t('irrigation.log')}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Field label="Date" type="date" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} />
          <Field label="Duration" value={draft.duration} onChange={(v) => setDraft({ ...draft, duration: v })} />
          <Field label="Method" value={draft.method} onChange={(v) => setDraft({ ...draft, method: v })} />
          <Field label="Water used" value={draft.water} onChange={(v) => setDraft({ ...draft, water: v })} />
        </div>
        <Button type="button" className="mt-4" variant="accent" onClick={addLog}>
          {t('irrigation.add')}
        </Button>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs uppercase tracking-wide dark:border-white/10">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Duration</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2">Water</th>
              </tr>
            </thead>
            <tbody>
              {log.map((row) => (
                <tr key={row.id} className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">{row.date}</td>
                  <td className="py-2 pr-4">{row.duration}</td>
                  <td className="py-2 pr-4">{row.method}</td>
                  <td className="py-2">{row.water}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!log.length ? <p className="mt-3 text-xs text-black/60 dark:text-white/60">No entries yet.</p> : null}
        </div>
      </Card>
    </PageWrapper>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
      <span className="mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-normal dark:border-white/15 dark:bg-[#0f2419]"
      />
    </label>
  )
}
