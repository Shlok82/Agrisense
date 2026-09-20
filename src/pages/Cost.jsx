import { useMemo, useRef, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { CostPieChart } from '../components/charts/CostPieChart.jsx'
import { computeFarmEconomics, pieDataFromCosts } from '../utils/costCalculator.js'
import { getCostSuggestions } from '../utils/ai.js'
import { useFarmer } from '../context/AppProviders.jsx'
import { useI18n } from '../context/AppProviders.jsx'
import { apiClient } from '../utils/apiClient.js'

const labels = {
  seed: 'Seed',
  fertilizer: 'Fertilizer',
  pesticide: 'Pesticide',
  labour: 'Labour',
  irrigation: 'Irrigation',
  misc: 'Miscellaneous',
}

export function Cost() {
  const { t } = useI18n()
  const { effectiveProfile } = useFarmer()
  const cardRef = useRef(null)
  const [costs, setCosts] = useState({
    seed: 18500,
    fertilizer: 24000,
    pesticide: 12000,
    labour: 36000,
    irrigation: 9000,
    misc: 6000,
  })
  const [yieldQ, setYieldQ] = useState(220)
  const [price, setPrice] = useState(4200)
  const [ideas, setIdeas] = useState([])
  const [ideasLoading, setIdeasLoading] = useState(false)
  const [ideasError, setIdeasError] = useState(null)

  useEffect(() => {
    if (effectiveProfile?._id) {
      apiClient.getCostRecordsByFarmerId(effectiveProfile._id).then(res => {
        if (res && res.length > 0) {
          const latest = res[res.length - 1]
          setCosts(prev => ({
            ...prev,
            seed: latest.seedCost || prev.seed,
            fertilizer: latest.fertilizerCost || prev.fertilizer,
            pesticide: latest.pesticideCost || prev.pesticide,
            labour: latest.labourCost || prev.labour,
          }))
          if (latest.expectedYield) setYieldQ(latest.expectedYield)
          if (latest.marketPrice) setPrice(latest.marketPrice)
        }
      }).catch(err => console.error(err))
    }
  }, [effectiveProfile?._id])

  const econ = useMemo(
    () =>
      computeFarmEconomics({
        landAcres: effectiveProfile.landAcres,
        costs,
        yieldQuintals: yieldQ,
        pricePerQuintal: price,
      }),
    [costs, effectiveProfile.landAcres, price, yieldQ],
  )

  const pie = useMemo(() => pieDataFromCosts(costs, labels), [costs])

  const breakdownKey = useMemo(
    () =>
      JSON.stringify({
        costs,
        yieldQ,
        price,
        land: effectiveProfile.landAcres,
        crop: effectiveProfile.crop,
      }),
    [costs, effectiveProfile.crop, effectiveProfile.landAcres, price, yieldQ],
  )

  useEffect(() => {
    let cancelled = false
    async function run() {
      setIdeasLoading(true)
      setIdeasError(null)
      try {
        const breakdown = {
          landAcres: effectiveProfile.landAcres,
          crop: effectiveProfile.crop,
          costs,
          ...computeFarmEconomics({
            landAcres: effectiveProfile.landAcres,
            costs,
            yieldQuintals: yieldQ,
            pricePerQuintal: price,
          }),
        }
        const suggestions = await getCostSuggestions(breakdown, effectiveProfile.crop)
        if (!cancelled) {
          let safeIdeas = []
          if (Array.isArray(suggestions)) {
            const idea1 = suggestions?.[0]
            const idea2 = suggestions?.[1]
            const idea3 = suggestions?.[2]
            safeIdeas = [idea1, idea2, idea3].filter(Boolean)
          }
          setIdeas(safeIdeas)
        }
      } catch (e) {
        if (!cancelled) {
          setIdeasError(e.message || t('common.error'))
          setIdeas([
            'Shift a portion of basal fertilizer closer to active roots to reduce top-dress repeats.',
            'Batch spray days with neighbours to share knapsack calibration time.',
            'Negotiate staggered labour payments tied to picking milestones instead of flat weekly hires.',
          ])
        }
      } finally {
        if (!cancelled) setIdeasLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- breakdownKey already encodes costs, yield, and price.
  }, [breakdownKey, effectiveProfile.crop, effectiveProfile.landAcres, t])

  async function saveCard() {
    if (effectiveProfile?._id) {
      try {
        await apiClient.createCostRecord({
          farmerId: effectiveProfile._id,
          seedCost: costs.seed,
          fertilizerCost: costs.fertilizer,
          pesticideCost: costs.pesticide,
          labourCost: costs.labour,
          expectedYield: yieldQ,
          marketPrice: price
        })
      } catch (err) {
        console.error('Failed to save to DB', err)
      }
    }

    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#fafaf7' })
    const img = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const imgWidth = pageWidth - 80
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.addImage(img, 'PNG', 40, 40, imgWidth, imgHeight)
    pdf.save('agrisense-cost-report.pdf')
    toast.success(t('toast.report'))
  }

  const profitClass =
    econ.profit >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'

  return (
    <PageWrapper title={t('cost.title')}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold">{t('cost.inputs')}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.keys(labels).map((k) => (
              <label key={k} className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
                <span className="mb-1 block">{labels[k]} (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={costs[k]}
                  onChange={(e) => setCosts({ ...costs, [k]: Number(e.target.value) })}
                  className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0f2419]"
                />
              </label>
            ))}
          </div>
          <label className="block text-sm font-semibold">
            {t('cost.yield')}
            <input
              type="number"
              min="0"
              value={yieldQ}
              onChange={(e) => setYieldQ(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0f2419]"
            />
          </label>
          <label className="block text-sm font-semibold">
            {t('cost.price')}
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0f2419]"
            />
          </label>
        </Card>

        <Card ref={cardRef} className="space-y-4 border-[#1a4731]/20">
          <h3 className="text-lg font-semibold">Season economics snapshot</h3>
          <p className="text-xs text-black/60 dark:text-white/60">
            {effectiveProfile.crop} on {effectiveProfile.landAcres} acres — values update live as you type.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label={t('cost.totalInvest')} value={`₹${econ.totalInvestment.toLocaleString('en-IN')}`} />
            <Stat label={t('cost.revenue')} value={`₹${econ.expectedRevenue.toLocaleString('en-IN')}`} />
            <Stat label={t('cost.profit')} value={`₹${Math.round(econ.profit).toLocaleString('en-IN')}`} highlight={profitClass} />
            <Stat label={t('cost.roi')} value={`${econ.roi.toFixed(1)}%`} />
          </div>
          <CostPieChart data={pie} />
          <Button type="button" variant="accent" onClick={saveCard}>
            {t('cost.save')}
          </Button>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold">{t('cost.suggestions')}</h3>
        {ideasLoading ? <p className="mt-2 text-sm">{t('common.loading')}</p> : null}
        {ideasError ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">{ideasError}</p> : null}
        {Array.isArray(ideas) && ideas.length > 0 ? (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-black/80 dark:text-white/80">
            {ideas.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : !ideasLoading ? (
          <p className="mt-3 text-sm text-black/60 dark:text-white/60">No suggestions available. Try again.</p>
        ) : null}
      </Card>
    </PageWrapper>
  )
}

function Stat({ label, value, highlight = '' }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">{label}</p>
      <p className={`mt-2 text-xl font-black ${highlight}`}>{value}</p>
    </div>
  )
}
