import { MarketingNav } from '../components/layout/MarketingNav.jsx'
import { PageWrapper } from '../components/layout/PageWrapper.jsx'
import { Card } from '../components/ui/Card.jsx'
import { useI18n } from '../context/AppProviders.jsx'

export function Privacy() {
  const { t } = useI18n()
  return (
    <div className="min-h-[100dvh] bg-[#fafaf7] dark:bg-[#0b1610]">
      <MarketingNav />
      <PageWrapper title={t('privacy.title')}>
        <Card>
          <p className="text-sm leading-relaxed text-black/80 dark:text-white/80">{t('privacy.lead')}</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-black/80 dark:text-white/80">
            <li>Browser storage holds your onboarding profile, generated advisories, and pest screening JSON.</li>
            <li>Photos you upload are sent to the Google Gemini API for analysis and are not retained on AgriSense servers in this demo.</li>
            <li>Weather data is fetched read-only from Open-Meteo without sending personal identifiers.</li>
            <li>Use the export tools if you need a portable copy; clearing browser storage removes local copies.</li>
          </ul>
        </Card>
      </PageWrapper>
    </div>
  )
}
