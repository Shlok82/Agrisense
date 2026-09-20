import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Skeleton } from '../components/ui/Skeleton.jsx'
import { analyseLeafImage } from '../utils/ai.js'
import { STORAGE_KEYS } from '../utils/constants.js'
import { useI18n } from '../context/AppProviders.jsx'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.pestHistory)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(entry) {
  const prev = loadHistory()
  const next = [entry, ...prev].slice(0, 5)
  localStorage.setItem(STORAGE_KEYS.pestHistory, JSON.stringify(next))
  return next
}

export function PestDetection() {
  const { t } = useI18n()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState(loadHistory)

  const onFiles = useCallback(async (files) => {
    const f = files?.[0]
    if (!f) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      toast.error('Please upload JPG, PNG, or WEBP.')
      return
    }
    setFile(f)
    setError(null)
    setResult(null)
    const dataUrl = await fileToDataUrl(f)
    setPreview(dataUrl)
    toast.success(t('toast.upload'))
  }, [t])

  const analyse = async () => {
    if (!preview) return
    setLoading(true)
    setError(null)
    try {
      const [meta, b64] = preview.split(',')
      const mediaType = meta.match(/data:(.*);/)?.[1] || file?.type || 'image/jpeg'
      const gemini = await analyseLeafImage(b64, mediaType)
      const sevRaw = String(gemini.severity || '').toLowerCase()
      const healthy = gemini.is_healthy === true || sevRaw === 'healthy'
      const severity =
        healthy || sevRaw === 'low'
          ? 'Low'
          : sevRaw.includes('high')
            ? 'High'
            : 'Medium'
      const payload = {
        healthy,
        diseaseName: gemini.disease_name || (healthy ? 'Healthy canopy' : 'Field diagnosis'),
        severity,
        affectedPercent: Number(gemini.affected_area_percent) || 0,
        actions: Array.isArray(gemini.action_steps) ? gemini.action_steps : [],
        treatment: gemini.treatment || { name: '', dosage: '', method: '' },
        prevention: Array.isArray(gemini.prevention_tips) ? gemini.prevention_tips : [],
        notes: '',
      }
      const entry = {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        preview,
        ...payload,
      }
      setResult(payload)
      const next = saveHistory(entry)
      setHistory(next)
      toast.success('Analysis complete')
    } catch (e) {
      setError(e.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const dropHandlers = useMemo(
    () => ({
      onDragOver: (e) => e.preventDefault(),
      onDrop: (e) => {
        e.preventDefault()
        void onFiles(e.dataTransfer.files)
      },
    }),
    [onFiles],
  )

  return (
    <PageWrapper title={t('pest.title')}>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <Card
            {...dropHandlers}
            className="border-2 border-dashed border-[#1a4731]/30 bg-white/50 p-8 text-center transition hover:border-[#f59e0b]/80 dark:border-white/20"
          >
            <UploadCloud className="mx-auto h-10 w-10 text-[#1a4731] dark:text-[#fafaf7]" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">{t('pest.upload')}</p>
            <label className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold dark:border-white/15 dark:bg-[#0f2419]">
              <span>Browse files</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => void onFiles(e.target.files)}
              />
            </label>
          </Card>

          {preview ? (
            <Card>
              <img src={preview} alt="Uploaded crop leaf preview" className="mx-auto max-h-80 rounded-2xl object-contain" />
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" variant="accent" onClick={analyse} disabled={loading || !preview}>
                  {t('pest.analyse')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFile(null)
                    setPreview('')
                    setResult(null)
                  }}
                >
                  Clear
                </Button>
              </div>
            </Card>
          ) : null}

          {loading ? (
            <Card>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="mt-3 h-24 w-full" />
            </Card>
          ) : null}

          {error ? (
            <Card className="border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-50">
              <p className="text-sm font-semibold">{t('common.error')}</p>
              <p className="text-sm opacity-80">{error}</p>
            </Card>
          ) : null}

          {result ? <ResultView result={result} t={t} /> : null}
        </div>

        <aside className="space-y-3" aria-label={t('pest.history')}>
          <h3 className="text-sm font-semibold">{t('pest.history')}</h3>
          {history.length === 0 ? (
            <p className="text-xs text-black/60 dark:text-white/60">No analyses yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-white/70 p-2 text-left text-xs hover:border-[#f59e0b]/60 dark:border-white/10 dark:bg-white/5"
                    onClick={() => setResult(h)}
                  >
                    <img src={h.preview} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="font-semibold">{h.healthy ? 'Healthy' : h.diseaseName}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </PageWrapper>
  )
}

function ResultView({ result, t }) {
  if (result.healthy) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-50">
          <h3 className="text-xl font-bold">{t('pest.healthy.title')}</h3>
          <p className="mt-2 text-sm">{t('pest.healthy.body')}</p>
        </Card>
      </motion.div>
    )
  }

  const sev = result.severity === 'High' ? 'critical' : result.severity === 'Medium' ? 'warning' : 'info'
  const pct = Math.min(100, Math.max(0, Number(result.affectedPercent) || 0))

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-black">{result.diseaseName}</h3>
          <Badge tone={sev === 'critical' ? 'critical' : sev === 'warning' ? 'warning' : 'info'}>{result.severity}</Badge>
        </div>
        <p className="mt-2 text-xs text-black/60 dark:text-white/60">{result.notes}</p>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide">Affected area estimate</p>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <motion.div
              className="h-full rounded-full bg-[#f59e0b]"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <p className="mt-1 text-sm font-semibold">{pct}%</p>
        </div>
      </Card>
      <Card>
        <h4 className="text-sm font-semibold">Immediate actions</h4>
        <ol className="mt-3 space-y-3 border-l-2 border-[#1a4731]/30 pl-4 dark:border-white/20">
          {(result.actions || []).map((a, i) => (
            <li key={i} className="relative text-sm">
              <span className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full bg-[#1a4731] text-xs font-bold text-[#fafaf7] dark:bg-[#fafaf7] dark:text-[#1a4731]">
                {i + 1}
              </span>
              {a}
            </li>
          ))}
        </ol>
      </Card>
      <Card>
        <h4 className="text-sm font-semibold">Treatment</h4>
        <p className="mt-2 text-sm font-semibold">{result.treatment?.name}</p>
        <p className="text-sm text-black/75 dark:text-white/75">Dosage: {result.treatment?.dosage}</p>
        <p className="text-sm text-black/75 dark:text-white/75">Application: {result.treatment?.method}</p>
      </Card>
      <Card>
        <h4 className="text-sm font-semibold">Prevention next season</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {(result.prevention || []).map((p, i) => (
            <span key={i} className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold dark:bg-white/10">
              {p}
            </span>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
