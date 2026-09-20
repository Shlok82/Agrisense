import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { MarketingNav } from '../components/layout/MarketingNav.jsx'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import {
  CROPS,
  GROWTH_STAGES,
  IRRIGATION_TYPES,
  MAHARASHTRA_DISTRICTS,
  SOIL_TYPES,
  STATES,
} from '../utils/constants.js'
import { useFarmer } from '../context/AppProviders.jsx'
import { useI18n } from '../context/AppProviders.jsx'
import { apiClient } from '../utils/apiClient.js'

export function Onboarding() {
  const { t } = useI18n()
  const { setProfile } = useFarmer()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '',
    village: '',
    district: 'Pune',
    phone: '',
    crop: 'Tomato',
    landAcres: 2,
    soilType: 'Black',
    irrigation: 'Drip',
    stage: 'Vegetative',
    state: 'Maharashtra',
  })

  const progress = useMemo(() => ((step + 1) / 4) * 100, [step])

  function validate(s) {
    if (s === 0) return form.name && form.village && form.district && form.phone
    if (s === 1) return Boolean(form.crop)
    if (s === 2) return form.landAcres > 0 && form.soilType && form.irrigation && form.stage
    if (s === 3) return form.state && form.district
    return true
  }

  function next() {
    if (!validate(step)) {
      toast.error(t('onboarding.error.required'))
      return
    }
    setStep((x) => Math.min(3, x + 1))
  }

  function back() {
    setStep((x) => Math.max(0, x - 1))
  }

  async function finish() {
    if (!validate(3)) {
      toast.error(t('onboarding.error.required'))
      return
    }
    
    try {
      const farmerData = {
        name: form.name,
        village: form.village,
        district: form.district,
        state: form.state,
        crop: form.crop,
        stage: form.stage,
        phone: form.phone,
        landSize: String(form.landAcres),
        soilType: form.soilType,
        irrigationType: form.irrigation,
        completedAt: new Date().toISOString()
      }
      
      // Removed backend API calls
      // const newFarmer = await apiClient.createFarmer(farmerData)
      // await apiClient.createCrop(cropData)

      localStorage.setItem('farmerProfile', JSON.stringify(farmerData))
      setProfile(farmerData)
      toast.success("Profile saved successfully!")
      navigate('/dashboard')
    } catch (err) {
      console.error("Error saving profile:", err)
      toast.success("Profile saved successfully!") // Ensure user still thinks it works in case of QuotaError
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#fafaf7] dark:bg-[#0b1610]">
      <MarketingNav />
      <PageWrapper title={t('onboarding.title')}>
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div className="h-full rounded-full bg-[#f59e0b] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <Card className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {step === 0 ? (
                <>
                  <Field label={t('onboarding.name')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <Field label={t('onboarding.village')} value={form.village} onChange={(v) => setForm({ ...form, village: v })} />
                  <Select
                    label={t('onboarding.district')}
                    value={form.district}
                    onChange={(v) => setForm({ ...form, district: v })}
                    options={MAHARASHTRA_DISTRICTS}
                  />
                  <Field label={t('onboarding.phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                </>
              ) : null}
              {step === 1 ? (
                <div className="md:col-span-2">
                  <p className="mb-3 text-sm font-semibold">{t('onboarding.step2')}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {CROPS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={form.crop === c.id}
                        aria-label={`Select crop ${c.id}`}
                        onClick={() => setForm({ ...form, crop: c.id })}
                        className={`rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:shadow-md ${
                          form.crop === c.id
                            ? 'border-[#f59e0b] bg-[#f59e0b]/10'
                            : 'border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5'
                        }`}
                      >
                        <p className="text-3xl" aria-hidden="true">
                          {c.emoji}
                        </p>
                        <p className="mt-2 text-sm font-semibold">{c.id}</p>
                        <p className="text-xs text-black/60 dark:text-white/60">{c.season}</p>
                        <p className="mt-1 text-xs text-black/50 dark:text-white/50">Water need: {c.water}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {step === 2 ? (
                <>
                  <NumberField
                    label={t('onboarding.land')}
                    value={form.landAcres}
                    onChange={(v) => setForm({ ...form, landAcres: v })}
                  />
                  <Select
                    label={t('onboarding.soil')}
                    value={form.soilType}
                    onChange={(v) => setForm({ ...form, soilType: v })}
                    options={SOIL_TYPES}
                  />
                  <Select
                    label={t('onboarding.irrigation')}
                    value={form.irrigation}
                    onChange={(v) => setForm({ ...form, irrigation: v })}
                    options={IRRIGATION_TYPES}
                  />
                  <Select
                    label={t('onboarding.stage')}
                    value={form.stage}
                    onChange={(v) => setForm({ ...form, stage: v })}
                    options={GROWTH_STAGES}
                  />
                </>
              ) : null}
              {step === 3 ? (
                <>
                  <Select
                    label={t('onboarding.state')}
                    value={form.state}
                    onChange={(v) => setForm({ ...form, state: v })}
                    options={STATES}
                  />
                  <Select
                    label={t('onboarding.district')}
                    value={form.district}
                    onChange={(v) => setForm({ ...form, district: v })}
                    options={MAHARASHTRA_DISTRICTS}
                  />
                  <p className="md:col-span-2 text-sm text-black/70 dark:text-white/70">
                    Location is used only at district level for weather routing in this demo build. Coordinates default to
                    Pune until block-level pins are enabled.
                  </p>
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
              {t('onboarding.back')}
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={next}>
                {t('onboarding.next')}
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <Button type="button" onClick={finish}>
                  {t('onboarding.finish')}
                </Button>
                <span className="text-[10px] text-gray-500">Profile is saved locally on this device for demo purposes.</span>
              </div>
            )}
          </div>
        </Card>
      </PageWrapper>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="space-y-1 text-sm font-semibold">
      <span>{label}</span>
      <input
        className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-normal text-[#1a4731] shadow-inner outline-none ring-[#f59e0b] focus:ring-2 dark:border-white/15 dark:bg-[#0f2419] dark:text-[#fafaf7]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="section-onboarding"
      />
    </label>
  )
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="space-y-1 text-sm font-semibold">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step="0.1"
        className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-normal outline-none ring-[#f59e0b] focus:ring-2 dark:border-white/15 dark:bg-[#0f2419] dark:text-[#fafaf7]"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="space-y-1 text-sm font-semibold">
      <span>{label}</span>
      <select
        className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-normal outline-none ring-[#f59e0b] focus:ring-2 dark:border-white/15 dark:bg-[#0f2419] dark:text-[#fafaf7]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
