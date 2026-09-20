import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { STORAGE_KEYS } from '../utils/constants.js'
import { useFarmer } from '../context/AppProviders.jsx'
import { useI18n } from '../context/AppProviders.jsx'

function read(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function Reports() {
  const { t } = useI18n()
  const { effectiveProfile } = useFarmer()
  const reportRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const advisories = useMemo(() => read(STORAGE_KEYS.advisories), [])
  const pests = useMemo(() => read(STORAGE_KEYS.pestHistory), [])

  const healthSeries = useMemo(() => {
    const base = 78
    return Array.from({ length: 7 }).map((_, i) => ({
      week: `W${i + 1}`,
      score: Math.min(100, Math.round(base + i * 3 + (advisories.length ? 4 : 0))),
    }))
  }, [advisories.length])

  const daysToHarvest = useMemo(() => {
    const target = new Date(effectiveProfile.expectedHarvest || '2099-12-31')
    const diff = Math.ceil((target - now) / 86400000)
    return Math.max(0, diff)
  }, [effectiveProfile.expectedHarvest, now])

  async function exportPdf() {
    if (!reportRef.current) return
    setBusy(true)
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#fafaf7' })
      const img = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 72
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(img, 'PNG', 36, 36, imgWidth, imgHeight)
      pdf.save('agrisense-season-report.pdf')
      toast.success(t('toast.report'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageWrapper title={t('reports.title')}>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="accent" disabled={busy} onClick={exportPdf}>
          {t('reports.export')}
        </Button>
      </div>

      <div ref={reportRef} className="printable space-y-6 rounded-3xl border border-black/5 bg-[#fafaf7] p-4 dark:border-white/10 dark:bg-[#0f2419] sm:p-6">
        <header className="space-y-2 border-b border-black/10 pb-4 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">Season summary</p>
          <h2 className="text-2xl font-black">
            {effectiveProfile.crop} · {effectiveProfile.landAcres} acres
          </h2>
          <p className="text-sm text-black/70 dark:text-white/70">
            Sowing reference {effectiveProfile.sowDate || '—'} · Expected harvest{' '}
            {effectiveProfile.expectedHarvest || '—'} · About {daysToHarvest} days remaining
          </p>
        </header>

        <Card>
          <h3 className="text-lg font-semibold">{t('reports.pest')}</h3>
          {pests.length === 0 ? (
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">No screenings logged yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {pests.map((p) => (
                <li key={p.id} className="rounded-xl border border-black/5 px-3 py-2 dark:border-white/10">
                  <span className="font-semibold">{p.healthy ? 'Healthy signal' : p.diseaseName}</span>
                  <span className="text-xs text-black/60 dark:text-white/60"> · {new Date(p.at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">{t('reports.advisories')}</h3>
          {advisories.length === 0 ? (
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">Generate advisories from the dashboard feed.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {advisories.slice(0, 12).map((a) => (
                <li key={a.id} className="rounded-xl border border-black/5 px-3 py-2 dark:border-white/10">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-xs text-black/70 dark:text-white/70">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Weekly crop health trend (modelled)</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#1a4731" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
