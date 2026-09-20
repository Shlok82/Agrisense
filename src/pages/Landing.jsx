import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Droplets, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import { MarketingNav } from '../components/layout/MarketingNav.jsx'
import { HeroField } from '../components/HeroField.jsx'
import { StatCounter } from '../components/StatCounter.jsx'
import { Card } from '../components/ui/Card.jsx'
import { TestimonialCarousel } from '../components/TestimonialCarousel.jsx'
import { useI18n } from '../context/AppProviders.jsx'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

const btn =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
const btnPrimary =
  `${btn} bg-[#1a4731] text-[#fafaf7] hover:bg-[#143824] focus-visible:outline-[#f59e0b] dark:bg-[#fafaf7] dark:text-[#1a4731]`
const btnOutline = `${btn} border border-[#1a4731]/30 bg-white/40 text-[#1a4731] backdrop-blur hover:border-[#1a4731]/60 dark:border-white/20 dark:text-[#fafaf7] dark:bg-white/5`

export function Landing() {
  const { t } = useI18n()

  return (
    <div className="min-h-[100dvh] bg-[#fafaf7] text-[#1a4731] dark:bg-[#0b1610] dark:text-[#fafaf7]">
      <MarketingNav />
      <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
        <div className="grain relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center">
          <div className="absolute inset-0">
            <HeroField />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative z-[1] max-w-2xl space-y-6"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur dark:border-white/15 dark:bg-white/5">
              <Sparkles className="h-3.5 w-3.5 text-[#f59e0b]" aria-hidden="true" />
              Precision agriculture for Indian smallholders
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t('landing.hero.title')}
            </h1>
            <p className="text-base leading-relaxed text-black/75 dark:text-white/75 sm:text-lg">
              {t('landing.hero.sub')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard" className={btnPrimary}>
                {t('nav.start')}
              </Link>
              <Link to="/onboarding" className={btnOutline}>
                {t('nav.onboarding')}
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="relative z-[1] grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3 lg:max-w-md lg:grid-cols-1"
          >
            <StatCounter
              label={t('landing.stats.farmers')}
              target={12000}
              format={(n) => `${Math.round(n).toLocaleString('en-IN')}+`}
            />
            <StatCounter label={t('landing.stats.accuracy')} target={94} format={(n) => `${Math.round(n)}%`} />
            <StatCounter
              label={t('landing.stats.savings')}
              target={8400}
              format={(n) => `₹${Math.round(n).toLocaleString('en-IN')}`}
            />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-4 py-16 sm:px-6">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('landing.features.title')}</h2>
          <p className="text-sm text-black/70 dark:text-white/70">
            Built like a cockpit: glass panels, crisp typography, and motion that explains — not distracts.
          </p>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-5 md:grid-cols-3"
        >
          <motion.div variants={item}>
            <Card className="h-full hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-xl bg-[#1a4731]/10 p-3 text-[#1a4731] dark:bg-white/10 dark:text-[#fafaf7]">
                <Leaf className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{t('landing.features.card1.title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/70 dark:text-white/70">
                {t('landing.features.card1.body')}
              </p>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="h-full hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-xl bg-[#1a4731]/10 p-3 text-[#1a4731] dark:bg-white/10 dark:text-[#fafaf7]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{t('landing.features.card2.title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/70 dark:text-white/70">
                {t('landing.features.card2.body')}
              </p>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="h-full hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-xl bg-[#1a4731]/10 p-3 text-[#1a4731] dark:bg-white/10 dark:text-[#fafaf7]">
                <Droplets className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{t('landing.features.card3.title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/70 dark:text-white/70">
                {t('landing.features.card3.body')}
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <TestimonialCarousel title={t('landing.testimonials.title')} />
        <p className="mt-10 text-center text-xs text-black/50 dark:text-white/50">{t('landing.footer.note')}</p>
      </section>
    </div>
  )
}
